/**
 * @file _buildMaptLedger.js
 * @summary Single-source-of-truth ledger builder for MAPT trust operations.
 * @description Produces a structured list of LedgerEntry objects that is
 * consumed by BOTH the running balance reducer (_calculateTrustOperations)
 * AND the tooltip renderer (views/helpers/helpers.js :: formatMaptTooltip).
 *
 * Business rules that gate which entries exist live inside the builder as
 * `if` statements — each guarded by a `// See:` citation back to the
 * rationale digest or a canonical source report. The entries themselves
 * — label, amount, note — are the single source of truth.
 *
 * See: docs/ledger-refactor/PRD-ledger-refactor.md §5.1
 * See: docs/ledger-refactor/rationale-digest.md §J (Ledger Integrity)
 * See: memory/feedback_ledger_single_source.md
 */

'use strict';

/**
 * @typedef {Object} LedgerEntry
 * @property {'income'|'expense'|'note'} side
 *   `income` has positive amount, `expense` has negative amount,
 *   `note` has amount === 0 (enforced as builder invariant).
 * @property {string} category
 *   Human-readable group: 'Arbor Roses' | 'Primary House' | 'SNT Condo'.
 * @property {string} label - Human-readable line label.
 * @property {number} amount - Signed; income positive, expense negative, note 0.
 * @property {string} [note] - Optional explanatory prose for the tooltip.
 * @property {('qualified_residence_interest'|'rental_expense'|'depreciation'|'salt_property_tax'|'rental_income'|'none')} [taxClass]
 *   Classification for the tax pass (see PRD §5.2).
 */

/**
 * Custom error thrown when the builder assembles an entry that violates
 * the note-amount invariant. A failing assertion is a contract bug in
 * the builder, never a runtime data problem.
 * @businessRule PRD REQ-TS-08
 */
class LedgerAssertionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LedgerAssertionError';
    }
}

/**
 * Assert that a note entry has amount exactly 0.
 * @param {LedgerEntry} entry
 * @throws {LedgerAssertionError}
 */
function assertNoteInvariant(entry) {
    if (entry.side === 'note' && entry.amount !== 0) {
        throw new LedgerAssertionError(
            `Note entry must have amount === 0, got ${entry.amount} for ` +
            `${entry.category}/${entry.label}`
        );
    }
}

/**
 * Push an entry into the ledger, enforcing the note invariant.
 * @param {LedgerEntry[]} entries
 * @param {LedgerEntry} entry
 */
function pushEntry(entries, entry) {
    assertNoteInvariant(entry);
    entries.push(entry);
}

/**
 * Determine whether Person A is resident in the primary house in a given year.
 * Person A leaves for memory care at `scenario.memory_care_year`.
 *
 * @param {number} year - Calendar year
 * @param {Object} scenario - Scenario configuration
 * @returns {boolean} True iff Person A still lives in the primary house
 * @businessRule rationale-digest §G — Person A's occupant obligations.
 */
function isPersonAResident(year, scenario) {
    const mcYear = scenario.memory_care_year;
    if (!mcYear) return true; // undefined → she never moves to MC in this scenario
    return year < mcYear;
}

/**
 * Build the MAPT ledger for a single projection year.
 *
 * This is the SINGLE SOURCE OF TRUTH for MAPT cash flow. Both the balance
 * reducer and the tooltip renderer consume the returned list.
 *
 * Invariants:
 *   1. Every `side: 'note'` entry has `amount === 0` (enforced at push).
 *   2. `trust_balance_delta = entries.reduce((s,e) => s + e.amount, 0)`.
 *   3. Grantor vs non-grantor trust_type is NOT inspected — tax attribution
 *      is a downstream concern handled by `_calculateMaptTaxPass.js`.
 *
 * @param {number} year - Projection year
 * @param {Object} scenario - Scenario row from DB
 * @param {Object} state - Resolved per-year state:
 *   {
 *     yearExpenses:        { primary_mortgage_interest,
 *                            AR_condo_property_tax, AR_condo_HOA,
 *                            AR_condo_insurance, AR_condo_maintenance,
 *                            AR_management_fee,
 *                            SNT_condo_mortgage_interest,   // tracked but NOT in ledger
 *                            SNT_condo_mortgage_principal,  // (deductible nowhere)
 *                            primary_house_taxes, primary_house_insurance,
 *                            primary_house_maintenance, primary_house_utilities },
 *     annualRentalIncome:  number,
 *     roommateIncome:      number,
 *     hasRentalIncome:     boolean,   // Arbor Roses still exists & rented
 *     condoSold:           boolean,   // Arbor Roses sold (upfront or otherwise)
 *     medicaidActive:      boolean,
 *   }
 * @returns {LedgerEntry[]}
 * @businessRule PRD REQ-LE-01 through REQ-LE-09
 */
function buildMaptLedger(year, scenario, state) {
    buildMaptLedger._callCount++;

    const entries = [];
    const {
        yearExpenses = {},
        annualRentalIncome = 0,
        roommateIncome = 0,
        hasRentalIncome = false,
        condoSold = false,
        medicaidActive = false,
    } = state || {};

    // Residency precedence: explicit `state.inMemoryCare` override (for unit
    // tests and call sites that already know), else derive from year vs
    // scenario.memory_care_year via isPersonAResident().
    const personAResident = (state && typeof state.inMemoryCare === 'boolean')
        ? !state.inMemoryCare
        : isPersonAResident(year, scenario);
    const arborExists = !condoSold;
    // Roommate gate: honor explicit scenario flag when present, else fall
    // back to "caller passed non-zero roommateIncome" (unit-test mode).
    const roommateEnabled = scenario.roommate_enabled === 1 || roommateIncome > 0;

    // === INCOME ===

    // See: rationale-digest §I — Arbor Roses rental cash always stays in MAPT
    // regardless of trust_type. Grantor status affects tax attribution only.
    if (hasRentalIncome && arborExists && annualRentalIncome > 0) {
        pushEntry(entries, {
            side: 'income',
            category: 'Arbor Roses',
            label: 'Rental income',
            amount: +annualRentalIncome,
            taxClass: 'rental_income',
        });
    }

    // See: PRD §8.1 — roommate viable only when Person A has vacated and
    // Medicaid has not yet seized income (pre-Medicaid window only).
    if (roommateEnabled && !personAResident && !medicaidActive && roommateIncome > 0) {
        pushEntry(entries, {
            side: 'income',
            category: 'Primary House',
            label: 'Roommate rent',
            amount: +roommateIncome,
            taxClass: 'rental_income',
        });
    }

    // === ARBOR ROSES OPERATING COSTS ===

    // See: rationale-digest §B — MAPT owns Arbor Roses outright; trust always
    // pays operating costs while the property exists.
    // Field names use AR_ prefix per migration 017 to disambiguate from
    // the SNT condo (which is owned by the third-party SNT, never on MAPT).
    if (arborExists) {
        const arborLines = [
            ['Property tax',  yearExpenses.AR_condo_property_tax, 'salt_property_tax'],
            ['HOA',           yearExpenses.AR_condo_HOA,          'rental_expense'],
            ['Insurance',     yearExpenses.AR_condo_insurance,    'rental_expense'],
            ['Maintenance',   yearExpenses.AR_condo_maintenance,  'rental_expense'],
            ['Mgmt fee',      yearExpenses.AR_management_fee,     'rental_expense'],
        ];
        for (const [label, amt, taxClass] of arborLines) {
            if (amt && amt > 0) {
                pushEntry(entries, {
                    side: 'expense',
                    category: 'Arbor Roses',
                    label,
                    amount: -amt,
                    taxClass,
                });
            }
        }
    }

    // === PRIMARY HOUSE IO MORTGAGE — ALWAYS ON MAPT ===

    // See: rationale-digest §G — primary IO mortgage is trust-level debt
    // (financed the SNT condo purchase); it is NOT Person A's obligation
    // and stays on the MAPT in every year regardless of residency.
    const primaryMortgageInterest = yearExpenses.primary_mortgage_interest || 0;
    if (primaryMortgageInterest > 0) {
        pushEntry(entries, {
            side: 'expense',
            category: 'Primary House',
            label: 'IO mortgage interest',
            amount: -primaryMortgageInterest,
            taxClass: 'qualified_residence_interest',
            note: 'Trust-level debt; financed the SNT condo purchase',
        });
    }

    // === PRIMARY HOUSE CARRYING COSTS — TIME-CONDITIONAL ===

    // See: rationale-digest §G — while Person A is resident she pays
    // tax/insurance/maintenance/utilities from her personal budget. On the
    // year she enters memory care these costs flip to the MAPT.
    if (personAResident) {
        // Zero-amount note entry documents WHY these are not in the balance,
        // so a future contributor cannot silently re-add them.
        pushEntry(entries, {
            side: 'note',
            category: 'Primary House',
            label: 'Tax, insurance, maintenance, utilities',
            amount: 0,
            note: 'Paid by Person A as occupant — not charged to trust',
        });
    } else {
        // See: rationale-digest §G — post-memory-care flip.
        const primaryLines = [
            ['Property tax',  yearExpenses.primary_house_taxes,       'salt_property_tax'],
            ['Insurance',     yearExpenses.primary_house_insurance,   'rental_expense'],
            ['Maintenance',   yearExpenses.primary_house_maintenance, 'rental_expense'],
            ['Utilities',     yearExpenses.primary_house_utilities,   'rental_expense'],
        ];
        for (const [label, amt, taxClass] of primaryLines) {
            if (amt && amt > 0) {
                pushEntry(entries, {
                    side: 'expense',
                    category: 'Primary House',
                    label,
                    amount: -amt,
                    taxClass,
                });
            }
        }
    }

    // === SNT CONDO MORTGAGE INTEREST — DEAD MONEY NOTE ===

    // See: rationale-digest §H — SNT condo mortgage interest is deductible
    // NOWHERE (not Person A §163(h), not SNT, not C2). The entry is a
    // zero-amount note so future contributors see the rule in situ and
    // cannot accidentally re-route it to any deduction total.
    // See: openspec/audits/Owner-Corrections-Session-2.md:7
    pushEntry(entries, {
        side: 'note',
        category: 'SNT Condo',
        label: 'Mortgage interest',
        amount: 0,
        note: 'SNT condo owned by third-party SNT; interest not deductible '
            + 'to Person A, MAPT, or SNT. C2 is beneficiary occupant, not tenant.',
    });

    // === SNT CONDO OPERATING COSTS — C2'S RESPONSIBILITY NOTE ===

    // See: rationale-digest §H — SNT condo property tax, insurance, and
    // maintenance are C2's responsibility, paid from the SNT seed money or
    // C2's SSDI. They MUST NOT appear on Person A's personal budget or the
    // MAPT budget. The model has no rows for these costs; this note documents
    // the rule so a future contributor cannot silently add them in the wrong
    // place.
    // See: openspec/audits/PROPERTY-CHEAT-SHEET.md
    pushEntry(entries, {
        side: 'note',
        category: 'SNT Condo',
        label: 'Property tax, insurance, maintenance',
        amount: 0,
        note: "C2's responsibility — paid from SNT seed money or SSDI. "
            + "Never on Person A's personal budget or the MAPT.",
    });

    return entries;
}

/**
 * Call counter — incremented on every invocation. Tests assert this is 0
 * after non-MAPT projections (REQ-TS-09).
 * @type {number}
 */
buildMaptLedger._callCount = 0;

module.exports = {
    buildMaptLedger,
    isPersonAResident,
    LedgerAssertionError,
};

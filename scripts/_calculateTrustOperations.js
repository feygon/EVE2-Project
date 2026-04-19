/**
 * @file Calculate Trust Operations
 * @summary MAPT trust tax (Form 1041/OR-41), balance deltas, ledger derivation.
 *
 * REFACTORED (ledger-refactor): The MAPT trust balance and property-expense
 * total are now derived from a SINGLE source of truth — the ledger entries
 * produced by `_buildMaptLedger.js`. The tooltip reads the same list.
 *
 * Bugs fixed by this refactor:
 *   Bug1 — Grantor branch previously stripped rental cash from the trust;
 *          now income entries always flow to trust delta regardless of
 *          trust_type (cash vs tax decoupling).
 *   Bug2 — Primary house carrying costs were unconditionally added to the
 *          trust; now they are gated by `isPersonAResident`.
 *   Bug4 — SNT condo mortgage interest was in both grantor Schedule A and
 *          non-grantor 1041 deduction totals; now excluded from both.
 *   Bug5 — Tooltip read a scalar `mapt_property_expenses` that diverged
 *          from the visible line items; now both read the same ledger.
 *
 * See: docs/ledger-refactor/PRD-ledger-refactor.md
 * See: docs/ledger-refactor/rationale-digest.md §J
 */

const { TAX_CONSTANTS } = require('./constants');
const { buildMaptLedger } = require('./_buildMaptLedger');

/**
 * Apply bracket-based tax calculation (reverse iteration).
 * @param {number} taxableIncome
 * @param {Array} brackets
 * @returns {number}
 */
function applyBrackets(taxableIncome, brackets) {
    if (taxableIncome <= 0) return 0;
    for (let i = brackets.length - 1; i >= 0; i--) {
        const prevLimit = i > 0 ? brackets[i - 1].limit : 0;
        if (taxableIncome > prevLimit) {
            return brackets[i].base + (taxableIncome - prevLimit) * brackets[i].rate;
        }
    }
    return 0;
}

/**
 * Sum expense-side entries (absolute value) for tooltip total display.
 * @param {Array} entries
 * @returns {number}
 */
function sumExpenses(entries) {
    let total = 0;
    for (const e of entries) {
        if (e.side === 'expense' && e.amount < 0) total += -e.amount;
    }
    return total;
}

/**
 * Sum income-side entries.
 * @param {Array} entries
 * @returns {number}
 */
function sumIncome(entries) {
    let total = 0;
    for (const e of entries) {
        if (e.side === 'income' && e.amount > 0) total += e.amount;
    }
    return total;
}

/**
 * Calculate MAPT trust operations for a year.
 *
 * @param {Object} params
 * @param {number} params.annualRentalIncome - Rental income routed to trust
 * @param {number} params.roommateIncome - Roommate income (0 if not enabled/not in MC)
 * @param {number} params.roommateDepreciation - Roommate depreciation amount
 * @param {number} params.condoValue - Current condo value (0 if sold)
 * @param {Object} params.scenario - Scenario config
 * @param {Object} params.yearExpenses - yearData.expenses object (for deduction lookup)
 * @param {boolean} params.inMemoryCare
 * @param {boolean} params.isGrantor
 * @param {boolean} params.medicaidActive
 * @param {boolean} [params.condoSold]
 * @param {number}  [params.year]
 * @returns {Object} { trustTax, deltaBalances, yearData }
 * @businessRule PRD REQ-BD-01 through REQ-BD-04, REQ-LE-09
 */
function calculateTrustOperations(params) {
    const {
        annualRentalIncome, roommateIncome, roommateDepreciation,
        condoValue, scenario, yearExpenses, inMemoryCare, isGrantor,
        medicaidActive, year, condoSold,
        trustBalance = 0, sntBalance = 0,
    } = params;

    const yearData = {};
    const deltaBalances = {};

    // Build the ledger — THE single source of truth for MAPT cash flow.
    // See: PRD §5.1
    const entries = buildMaptLedger(year, scenario, {
        yearExpenses,
        annualRentalIncome,
        roommateIncome,
        hasRentalIncome: annualRentalIncome > 0,
        condoSold: condoSold === true || condoValue === 0,
        medicaidActive,
    });

    // Store on yearData so tooltip / debug-sidebar can read the same list.
    yearData.mapt_ledger_entries = entries;

    // Derive trust-balance delta from the same list (REQ-BD-01).
    const ledgerDelta = entries.reduce((s, e) => s + e.amount, 0);

    // Derive display total from the same list (REQ-BD-02).
    const maptPropertyExpenses = sumExpenses(entries);
    const trustGrossIncome = sumIncome(entries);

    yearData.mapt_property_expenses = maptPropertyExpenses;
    yearData.trust_gross_income = trustGrossIncome;

    // --- C3 direct-pay override (Medicaid + roommate grantor path) ---
    // See: rationale-digest §F — post-Medicaid on grantor path, C3 pays
    // housing costs directly so nothing is seized. We honor this by
    // reclassifying primary carrying costs as a separate field rather than
    // modifying the ledger (ledger is cash-accurate for the trust's view;
    // direct-pay is a downstream transform).
    let effectiveDelta = ledgerDelta;
    if (isGrantor && medicaidActive && scenario.roommate_enabled === 1 && inMemoryCare) {
        // Remove primary carrying costs from the trust's effective outflow —
        // C3 pays them directly. We compute the set the ledger added while
        // personAResident was false.
        let primaryCarrying = 0;
        for (const e of entries) {
            if (e.category === 'Primary House' && e.side === 'expense' &&
                e.label !== 'IO mortgage interest') {
                primaryCarrying += -e.amount;
            }
        }
        yearData.c3_direct_housing_costs = primaryCarrying;
        effectiveDelta += primaryCarrying; // add back (un-deduct)
        yearData.mapt_property_expenses = maptPropertyExpenses - primaryCarrying;
    }

    // === SNT BACKUP + SHORTFALL TRACKING ===
    // Mirrors the pre-refactor logic (previously in _calculateYearExpenses.js).
    // When the MAPT can't fully cover expenses, SNT is a discretionary backup.
    // Residual unfunded expense becomes `mapt_trust_shortfall`.
    if (effectiveDelta < 0) {
        const cashNeed = -effectiveDelta; // positive amount needed
        const availableMapt = Math.max(0, trustBalance + sumIncome(entries));
        if (availableMapt >= cashNeed) {
            yearData.mapt_checking_spent = cashNeed;
        } else {
            const fromMapt = Math.max(0, availableMapt);
            let remainder = cashNeed - fromMapt;
            yearData.mapt_checking_spent = fromMapt;
            if (sntBalance > 0 && remainder > 0) {
                const fromSnt = Math.min(sntBalance, remainder);
                deltaBalances.sntBalance = (deltaBalances.sntBalance || 0) - fromSnt;
                remainder -= fromSnt;
                yearData.snt_mapt_backup = fromSnt;
            }
            if (remainder > 0) {
                yearData.mapt_trust_shortfall = remainder;
            }
        }
    }

    // === GRANTOR PATH ===
    // See: rationale-digest §F — grantor trust: informational 1041 only,
    // no trust-level tax. All income/deductions attribute to Person A's
    // 1040 via the tax pass (downstream concern). Cash flow stays here.
    if (isGrantor) {
        yearData.trust_type = 'grantor';
        yearData.trust_gross_income = trustGrossIncome;
        yearData.trust_total_deductions = 0;
        yearData.trust_taxable_income = 0;
        yearData.trust_federal_tax = 0;
        yearData.trust_oregon_tax = 0;
        yearData.trust_total_tax = 0;

        if (roommateIncome > 0) {
            yearData.roommate_net_to_trust = roommateIncome;
        }
        deltaBalances.trustBalance = effectiveDelta;
        return { yearData, deltaBalances };
    }

    // === NON-GRANTOR PATH ===
    // See: rationale-digest §F — trust files separate 1041/OR-41.
    // Schedule-E-equivalent deductions stay inside the trust.

    // SNT condo mortgage interest is NOT deducted here.
    // See: rationale-digest §H
    const condoBasis = scenario.condo_original_basis || 400000;
    const condoDepr = condoValue > 0 ? (condoBasis * 0.80 / 27.5) : 0;

    // Trust deductions = all expense-side ledger entries + depreciation
    // (depreciation is a non-cash tax concept, not in the cash ledger).
    const trustCashDeductions = maptPropertyExpenses;
    const trustTotalDeductions = condoDepr + trustCashDeductions + (roommateDepreciation || 0);

    const trustExemption = TAX_CONSTANTS.trustFederal.exemption;
    const trustTaxableIncome = trustGrossIncome - trustTotalDeductions - trustExemption;

    yearData.trust_taxable_income = trustTaxableIncome;
    yearData.trust_total_deductions = trustTotalDeductions;

    const trustFederalTax = applyBrackets(trustTaxableIncome, TAX_CONSTANTS.trustFederal.brackets);
    const trustOregonTax = applyBrackets(trustTaxableIncome, TAX_CONSTANTS.trustOregon.brackets);
    const trustTotalTax = trustFederalTax + trustOregonTax;

    yearData.trust_federal_tax = trustFederalTax;
    yearData.trust_oregon_tax = trustOregonTax;
    yearData.trust_total_tax = trustTotalTax;
    yearData.roommate_tax = trustTotalTax;
    yearData.roommate_taxable = Math.max(0, trustTaxableIncome);

    // Balance delta = ledger delta - trust tax (tax is a cash outflow
    // outside the operating ledger).
    let trustDelta = effectiveDelta - trustTotalTax;
    if (roommateIncome > 0) {
        yearData.roommate_net_to_trust = roommateIncome - trustTotalTax;
    }
    deltaBalances.trustBalance = trustDelta;

    return { trustTotalTax, deltaBalances, yearData };
}

module.exports = { calculateTrustOperations };

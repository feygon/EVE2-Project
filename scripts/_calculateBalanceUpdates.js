/**
 * @file Balance Updates & Cumulative Ledger
 * @summary Records end-of-year balances, applies IRA growth, and snapshots the cumulative ledger.
 *
 * @DECISION Extracted from _projectionEngine.js (lines 582-689) to reduce the size of the
 *           year-loop body. The Medicaid look-ahead (lines 634-644) intentionally stays in
 *           the engine because it mutates `medicaidTriggerYear` — a loop-level variable.
 */

const { TAX_CONSTANTS } = require('./constants');

/**
 * Compute the marginal tax rate at a given taxable income, using the
 * highest bracket the income falls into.
 * @param {number} taxableIncome
 * @param {Array<{limit:number,rate:number}>} brackets
 * @returns {number} marginal rate (e.g. 0.22)
 */
function marginalRate(taxableIncome, brackets) {
    if (taxableIncome <= 0) return brackets[0].rate;
    for (let i = brackets.length - 1; i >= 0; i--) {
        const prevLimit = i > 0 ? brackets[i - 1].limit : 0;
        if (taxableIncome > prevLimit) return brackets[i].rate;
    }
    return brackets[0].rate;
}

/**
 * Record end-of-year balances, apply IRA growth, and snapshot the cumulative ledger.
 * @param {Object} p - All values needed from the year-loop scope
 * @param {Object} p.yearData - Mutable year data object being built for this projection year
 * @param {number} p.fromSdiraChecking - Amount distributed from SDIRA checking this year
 * @param {number} p.fromManagedIra - Amount distributed from managed IRA this year
 * @param {number} p.managedIraBalance - Managed IRA balance after withdrawals, before growth
 * @param {number} p.sdiraCheckingBalance - SDIRA checking balance at end of year
 * @param {number} p.ltcSavingsBalance - LTC savings balance at end of year
 * @param {number} p.ltcSpending - Amount spent from LTC savings this year
 * @param {number} p.primaryMortgageBalance - Primary mortgage balance at end of year
 * @param {number} p.condoMortgageBalance - Condo mortgage balance at end of year
 * @param {number} p.mortgageBalance - Combined mortgage balance at end of year
 * @param {boolean} p.isMAPT - Whether this is a MAPT trust scenario
 * @param {number} p.trustBalance - MAPT trust checking balance
 * @param {number} p.sntBalance - SNT balance
 * @param {number} p.year - Current projection year
 * @param {number} p.lookbackClearYear - Year the Medicaid lookback period clears
 * @param {number} p.externalIncome - Total external income for the year
 * @param {number} p.GROSS_EXPENSE_TARGET - Gross personal budget target
 * @param {boolean} p.inMemoryCare - Whether Person A is in memory care
 * @param {number} p.totalExpenses - Total expenses for the year
 * @param {number} p.lifestyleExpense - Lifestyle spending amount
 * @param {Object} p.scenario - Scenario configuration object
 * @param {Object} p.rateSet - Rate assumptions (growth rates, inflation, etc.)
 * @param {number} p.maptPropertyExpenses - MAPT property expenses paid from trust
 * @param {Object} p.ledger - Mutable cumulative ledger object
 * @returns {{ managedIraBalance: number, yearData: Object, ledgerSnapshot: Object }}
 */
function calculateBalanceUpdates(p) {
    const {
        yearData,
        fromSdiraChecking,
        fromManagedIra,
        managedIraBalance: managedIraBalanceIn,
        sdiraCheckingBalance,
        ltcSavingsBalance,
        ltcSpending,
        primaryMortgageBalance,
        condoMortgageBalance,
        mortgageBalance,
        isMAPT,
        trustBalance,
        sntBalance,
        year,
        lookbackClearYear,
        externalIncome,
        GROSS_EXPENSE_TARGET,
        inMemoryCare,
        totalExpenses,
        lifestyleExpense,
        scenario,
        rateSet,
        maptPropertyExpenses,
        ledger
    } = p;

    // --- IRA distributions breakdown ---
    yearData.sdira_distributions = fromSdiraChecking;
    yearData.managed_ira_distributions = fromManagedIra;

    // --- ManagedIRA growth AFTER withdrawals ---
    const managedIraGrowthRate = scenario.ira_growth || rateSet?.ira_growth_rate || 0.04;
    yearData.managed_ira_growth = managedIraBalanceIn * managedIraGrowthRate;
    yearData.managed_ira_growth_rate = managedIraGrowthRate;
    const managedIraBalance = managedIraBalanceIn * (1 + managedIraGrowthRate);

    // SDIRA Checking has negligible interest (cash account)
    yearData.sdira_growth = 0;

    // --- End-of-year IRA balances ---
    yearData.sdira_checking_close = sdiraCheckingBalance;
    yearData.managed_ira_close = managedIraBalance;
    yearData.total_ira_close = sdiraCheckingBalance + managedIraBalance;

    // --- LTC Savings ---
    yearData.ltc_savings_spent = ltcSpending;
    yearData.ltc_savings_close = ltcSavingsBalance;

    // --- Mortgage balances ---
    yearData.primary_mortgage_close = primaryMortgageBalance;
    yearData.condo_mortgage_close = condoMortgageBalance;
    yearData.mortgage_balance_close = mortgageBalance;

    // --- Trust balance (MAPT only) ---
    if (isMAPT) {
        yearData.trust_balance = trustBalance;
        yearData.snt_balance = sntBalance;
        yearData.trust_protected = (year >= lookbackClearYear);
        yearData.lookback_clear_year = lookbackClearYear;
    }

    // --- Total income / personal budget ---
    yearData.income.total = externalIncome;
    yearData.personal_budget = GROSS_EXPENSE_TARGET;

    // --- Memory care status & base expenses ---
    yearData.in_memory_care = inMemoryCare;
    yearData.personA_lifestyle_extras = totalExpenses - lifestyleExpense - (yearData.expenses.memory_care || 0);

    // --- Liquid assets ---
    yearData.liquid_assets_open = yearData.sdira_checking_open + yearData.managed_ira_open + yearData.ltc_savings_open;
    yearData.liquid_assets_total = sdiraCheckingBalance + managedIraBalance + ltcSavingsBalance;

    // NOTE: Medicaid look-ahead stays in the engine (mutates loop-level medicaidTriggerYear)

    // --- Cumulative ledger updates (MAPT only) ---
    if (isMAPT) {
        // Track rental income allocation
        if (yearData.rental_to_trust && maptPropertyExpenses > 0) {
            // Arbor Roses operating costs (MAPT pays). See migration 017.
            const condoExp = (yearData.expenses.AR_condo_property_tax || 0) +
                (yearData.expenses.AR_condo_HOA || 0) +
                (yearData.expenses.AR_condo_insurance || 0) +
                (yearData.expenses.AR_condo_maintenance || 0) +
                (yearData.expenses.AR_management_fee || 0);
            const primaryMortgage = yearData.expenses.primary_mortgage_interest || 0;
            const primaryHouseExp = inMemoryCare ? ((yearData.expenses.primary_house_taxes || 0) +
                (yearData.expenses.primary_house_insurance || 0) + (yearData.expenses.primary_house_maintenance || 0) +
                (yearData.expenses.primary_house_utilities || 0)) : 0;

            ledger.cum_rental_to_condo_expenses += condoExp;
            ledger.cum_rental_to_primary_mortgage += primaryMortgage;
            ledger.cum_rental_to_primary_house += primaryHouseExp;
        }
        // Roommate income allocation
        if (yearData.income && yearData.income.roommate) {
            ledger.cum_roommate_to_primary += yearData.income.roommate;
        }
        // SNT condo mortgage totals (across all years, regardless of payer).
        // The "condo_mortgage" rows in the model are unambiguously the SNT condo
        // because Arbor Roses is owned outright. See migration 017 for the rename.
        if (yearData.expenses.SNT_condo_mortgage_principal) {
            const sntInt = yearData.expenses.SNT_condo_mortgage_interest || 0;
            const sntPrin = yearData.expenses.SNT_condo_mortgage_principal;
            ledger.cum_SNT_condo_mortgage_interest += sntInt;
            ledger.cum_SNT_condo_mortgage_principal += sntPrin;
            ledger.cum_SNT_condo_mortgage_paid += sntInt + sntPrin;

            // === Person A → C2 attribution ===
            // Per business rule: Person A pays SNT condo P&I until Medicaid
            // activation in MAPT scenarios, or until death in No Trust scenarios.
            // After Medicaid activates, the SNT pays from its own balance — and
            // those funds are already accounted for in c2_early_inheritance via
            // the IRA→SNT liquidation, so we MUST NOT double-count them here.
            //
            // The marker that the SNT (not Person A) paid is yearData.snt_condo_mortgage,
            // which _calculateYearExpenses.js sets only on the medicaidActive branch.
            const personAPaidThisYear = !yearData.snt_condo_mortgage;
            if (personAPaidThisYear) {
                ledger.cum_personA_paid_SNT_condo_principal += sntPrin;
                ledger.cum_personA_paid_SNT_condo_interest += sntInt;

                // Marginal tax burden, computed from Person A's actual marginal
                // bracket position this year. Uses the federal + Oregon brackets
                // in TAX_CONSTANTS to find the rate at the top of the year's
                // taxable income, then applies the gross-up math:
                //
                //   To net $X for the mortgage payment, Person A must withdraw
                //   $X / (1 - rate) from the IRA. The extra tax cost is therefore
                //   $X * (rate / (1 - rate)).
                //
                // The marginal rate is the rate the optimizer's last withdrawal
                // dollar landed on — i.e., the rate the SNT-condo-funding slice
                // of the withdrawal actually paid.
                //
                // Note: this is still an approximation in two senses:
                //   (a) Bracket boundary effects within a single P&I gross-up are
                //       ignored (the gross-up is small enough — ~$1-2k extra
                //       withdrawal — that it rarely crosses a boundary).
                //   (b) IRMAA cliffs are tracked separately (cum_personA_SNT_extra_irmaa)
                //       and remain $0 until Bug 3 (IRMAA computation) is fixed.
                // Per decision 2026-04-06: use IRS-definition taxable income
                // (AGI - deduction) for bracket lookup, not the deleted
                // `taxable_income_total` (which was gross income components).
                const taxableIncome = yearData.taxable_income_after_deductions || 0;
                const fedMarginal = marginalRate(taxableIncome, TAX_CONSTANTS.federal.brackets);
                const orMarginal  = marginalRate(taxableIncome, TAX_CONSTANTS.oregon.brackets);
                const blendedMarginal = fedMarginal + orMarginal;
                const grossUpFactor = blendedMarginal / (1 - blendedMarginal);
                const extraTax = (sntInt + sntPrin) * grossUpFactor;
                ledger.cum_personA_SNT_extra_tax += extraTax;

                // IRMAA cliff cost is currently 0 (Bug 3 — IRMAA computation
                // inactive in current engine). Once Bug 3 is fixed, this should
                // accumulate the marginal IRMAA surcharge attributable to the
                // extra IRA withdrawal volume.
                // ledger.cum_personA_SNT_extra_irmaa += <computed value>;
            }
        }
        // SNT backup draws
        if (yearData.snt_mapt_backup) {
            ledger.cum_snt_mapt_backup += yearData.snt_mapt_backup;
        }
        // IRA liquidation to SNT
        if (yearData.snt_funded) {
            ledger.snt_ira_liquidation += yearData.snt_funded;
        }

        yearData.ledger = JSON.parse(JSON.stringify(ledger)); // snapshot
    }
    // Non-MAPT scenarios: still snapshot the ledger for debug sidebar
    if (!isMAPT) {
        yearData.ledger = JSON.parse(JSON.stringify(ledger));
    }

    return {
        managedIraBalance,
        yearData,
        ledgerSnapshot: ledger
    };
}

module.exports = { calculateBalanceUpdates };

/**
 * @file Medicaid Transition Logic
 * @summary IRA/annuity liquidation to SNT, split-year tax, condo mortgage payoff
 * @description Extracted from _projectionEngine.js (Step 3 of refactor).
 *
 * Handles:
 * - Trigger year: full liquidation of IRA + LTC savings + annuity surrender → SNT
 * - Split-year tax withholding (Dec/Jan) to minimize bracket impact
 * - Condo mortgage payoff from after-tax proceeds
 * - Look-ahead: detect when next year's shortfall exceeds liquid assets
 */

const { TAX_CONSTANTS } = require('./constants');

/**
 * Private helper: calculate federal + Oregon tax on a given income with deduction.
 * Uses reverse bracket iteration (deliberately different from _calculateTaxes.js).
 * Both produce identical results — verified by cross-check test.
 */
function calcTaxOnIncome(totalIncome, deduction) {
    const taxable = Math.max(0, totalIncome - deduction);
    let fedTax = 0;
    const brackets = TAX_CONSTANTS.federal.brackets;
    for (let i = brackets.length - 1; i >= 0; i--) {
        const prevLimit = i > 0 ? brackets[i - 1].limit : 0;
        if (taxable > prevLimit) {
            fedTax = brackets[i].base + (taxable - prevLimit) * brackets[i].rate;
            break;
        }
    }
    const orTaxable = Math.max(0, totalIncome - TAX_CONSTANTS.oregon.standardDeduction);
    let orTax = 0;
    const orBrackets = TAX_CONSTANTS.oregon.brackets;
    for (let i = orBrackets.length - 1; i >= 0; i--) {
        const prevLimit = i > 0 ? orBrackets[i - 1].limit : 0;
        if (orTaxable > prevLimit) {
            orTax = orBrackets[i].base + (orTaxable - prevLimit) * orBrackets[i].rate;
            break;
        }
    }
    return { federal: fedTax, oregon: orTax, total: fedTax + orTax };
}

/**
 * Execute Medicaid transition: liquidate all financial assets to SNT.
 *
 * @param {Object} params
 * @param {number} params.year - Trigger year
 * @param {number} params.sdiraCheckingBalance
 * @param {number} params.managedIraBalance
 * @param {number} params.ltcSavingsBalance
 * @param {number} params.condoMortgageBalance
 * @param {number} params.primaryMortgageBalance
 * @param {Array} params.instruments - Financial instruments for surrender calc
 * @param {Array} params.incomeSources - For SS amount
 * @param {Object} params.scenario - Scenario config
 * @param {Object} params.rateSet - Rate set
 * @param {Array} params.years - Prior year results (for previousYearData)
 * @param {Function} params.calculateMemoryCare - Memory care calc function
 * @returns {Object} { setBalances, yearData }
 */
function executeMedicaidTransition(params) {
    const {
        year, sdiraCheckingBalance, managedIraBalance, ltcSavingsBalance,
        condoMortgageBalance, primaryMortgageBalance,
        instruments, incomeSources, scenario, rateSet, years,
        calculateMemoryCare
    } = params;

    const yearData = {};

    // Liquidate IRA + savings
    const liquidBalances = sdiraCheckingBalance + managedIraBalance + ltcSavingsBalance;

    // Annuity surrender value (remaining payments at 15% loss)
    const annuitySurrenderRate = 0.85;
    let annuitySurrenderValue = 0;
    instruments.forEach(inst => {
        if (!inst.monthly_payment || !inst.payment_end_date) return;
        const instEndYear = parseInt(inst.payment_end_date.substring(0, 4));
        const instEndMonth = parseInt(inst.payment_end_date.substring(5, 7));
        if (instEndYear < year) return;
        const remainingMonths = (instEndYear - year) * 12 + instEndMonth;
        const totalRemainingPayments = remainingMonths * inst.monthly_payment;
        annuitySurrenderValue += totalRemainingPayments * annuitySurrenderRate;
    });

    const totalLiquidation = liquidBalances + annuitySurrenderValue;

    // Split-year tax withholding (Dec/Jan)
    const halfLiquidation = totalLiquidation / 2;
    const ssInc = incomeSources.find(i => i.source_type === 'social_security');
    const ssForTax = scenario.ssdi_monthly ? scenario.ssdi_monthly * 12
        : (ssInc ? (ssInc.annual_amount || 36000) : 36000);

    // Year 1 (Dec, pre-liquidation year)
    const prevYearData = years.length > 0 ? years[years.length - 1] : null;
    const prevMemoryCare = prevYearData ? (prevYearData.expenses.memory_care || 0) : 0;
    const year1Income = ssForTax * 0.85 + halfLiquidation +
        (prevYearData ? (prevYearData.income.ira_distributions || 0) : 0);
    const year1MedicalDeduction = Math.max(0, prevMemoryCare - year1Income * 0.075);
    const year1Deduction = Math.max(TAX_CONSTANTS.federal.standardDeduction2026, year1MedicalDeduction);
    const year1Result = calcTaxOnIncome(year1Income, year1Deduction);

    // Year 2 (Jan, Medicaid year)
    const year2MemoryCare = calculateMemoryCare(scenario, year, rateSet, scenario.memory_care_year) / 12;
    const year2Income = ssForTax * 0.85 + halfLiquidation;
    const year2MedicalDeduction = Math.max(0, year2MemoryCare - year2Income * 0.075);
    const year2Deduction = Math.max(TAX_CONSTANTS.federal.standardDeduction2026, year2MedicalDeduction);
    const year2Result = calcTaxOnIncome(year2Income, year2Deduction);

    const liquidationTaxWithholding = year1Result.total + year2Result.total;
    const afterTaxLiquidation = totalLiquidation - liquidationTaxWithholding;

    // Condo mortgage payoff
    let condoMortgagePayoff = 0;
    let newCondoMortgageBalance = condoMortgageBalance;
    let newMortgageBalance = primaryMortgageBalance + condoMortgageBalance;
    if (condoMortgageBalance > 0) {
        condoMortgagePayoff = condoMortgageBalance;
        newCondoMortgageBalance = 0;
        newMortgageBalance = primaryMortgageBalance;
    }

    const netToSnt = afterTaxLiquidation - condoMortgagePayoff;

    // Build yearData fields
    yearData.liquidation_tax_withholding = liquidationTaxWithholding;
    yearData.liquidation_tax_year1 = year1Result.total;
    yearData.liquidation_tax_year2 = year2Result.total;
    yearData.liquidation_year1_deduction = year1Deduction;
    yearData.liquidation_year2_deduction = year2Deduction;
    yearData.liquidation_year1_medical = prevMemoryCare;
    yearData.condo_mortgage_payoff = condoMortgagePayoff;
    yearData.medicaid_invoked = true;
    yearData.snt_funded = netToSnt;
    yearData.snt_funded_gross = totalLiquidation;
    yearData.snt_funded_liquid = liquidBalances;
    yearData.snt_funded_annuity_surrender = annuitySurrenderValue;
    yearData.snt_funded_mortgage_payoff = condoMortgagePayoff;
    yearData.sdira_checking_open = 0;
    yearData.managed_ira_open = 0;
    yearData.total_ira_open = 0;
    yearData.ltc_savings_open = 0;

    return {
        setBalances: {
            sdiraCheckingBalance: 0,
            managedIraBalance: 0,
            ltcSavingsBalance: 0,
            condoMortgageBalance: newCondoMortgageBalance,
            mortgageBalance: newMortgageBalance,
            medicaidActive: true
        },
        deltaBalances: {
            sntBalance: netToSnt
        },
        yearData
    };
}

/**
 * Look ahead: should Medicaid trigger next year?
 *
 * @param {Object} params
 * @param {boolean} params.isMAPT
 * @param {boolean} params.medicaidActive
 * @param {number|null} params.medicaidTriggerYear
 * @param {boolean} params.inMemoryCare
 * @param {number} params.sdiraCheckingBalance
 * @param {number} params.managedIraBalance
 * @param {number} params.ltcSavingsBalance
 * @param {number} params.shortfall
 * @param {number} params.year
 * @returns {Object|null} { medicaidTriggerYear, preLiquidation: true } or null
 */
function medicaidLookAhead(params) {
    const {
        isMAPT, medicaidActive, medicaidTriggerYear, inMemoryCare,
        sdiraCheckingBalance, managedIraBalance, ltcSavingsBalance,
        shortfall, year, memoryCareYear
    } = params;

    if (!isMAPT || medicaidActive || medicaidTriggerYear || !inMemoryCare) {
        return null;
    }

    // Hard cap: 3 years of private-pay memory care, then Medicaid activates.
    // Facility must guarantee a Medicaid bed after 3 years of private pay.
    const maxPrivatePayYears = 3;
    const mcStartYear = memoryCareYear || year;
    const yearsInMC = year - mcStartYear;
    if (yearsInMC >= maxPrivatePayYears - 1) {
        // Year 2 of MC (0-indexed): trigger Medicaid for next year (year 3)
        return { medicaidTriggerYear: mcStartYear + maxPrivatePayYears, preLiquidation: true };
    }

    const closingLiquid = sdiraCheckingBalance + managedIraBalance + ltcSavingsBalance;
    const estimatedNextShortfall = shortfall > 0 ? shortfall * 1.05 : 0;

    if (closingLiquid > 0 && closingLiquid < estimatedNextShortfall) {
        return { medicaidTriggerYear: year + 1, preLiquidation: true };
    }

    return null;
}

module.exports = { executeMedicaidTransition, medicaidLookAhead, calcTaxOnIncome };

/**
 * Tax Calculation Module
 *
 * Calculates federal and Oregon state income taxes.
 * Extracted from NickersonCallbacks.js (Phase B: Separation of Concerns)
 *
 * CRITICAL FOR PHASE F:
 * - DP optimizer calls this ~1.2M times during backward recursion
 * - Must be fast (no database queries, no external calls)
 * - Must be pure function (same inputs → same outputs)
 * - Preserves "the wash" logic (IRA withdrawals partially offset by medical deduction)
 *
 * @module _calculateTaxes
 */

const { TAX_CONSTANTS } = require('./constants');

/**
 * Calculate federal income tax using 2025 brackets (single filer, age 65+)
 *
 * @param {number} agi - Adjusted Gross Income
 * @param {number} deduction - Deduction amount (standard or itemized)
 * @param {number} year - Tax year (for future bracket inflation)
 *
 * @returns {number} Federal income tax
 */
function calculateFederalTax(agi, deduction, year = 2026) {
    if (agi <= 0) return 0;

    // Use provided deduction or fall back to standard deduction
    const actualDeduction = deduction !== undefined ? deduction : TAX_CONSTANTS.federal.standardDeduction2026;

    // Calculate taxable income after deduction
    const taxableIncome = Math.max(0, agi - actualDeduction);

    if (taxableIncome === 0) return 0;

    // 2025 tax brackets (single filer) - applied to taxable income
    const brackets = [
        { limit: 11925, rate: 0.10, base: 0 },
        { limit: 48475, rate: 0.12, base: 1192.50 },
        { limit: 103350, rate: 0.22, base: 5578.50 },
        { limit: Infinity, rate: 0.24, base: 17651 }
    ];

    // Find applicable bracket
    let tax = 0;
    let previousLimit = 0;

    for (const bracket of brackets) {
        if (taxableIncome <= bracket.limit) {
            tax = bracket.base + (taxableIncome - previousLimit) * bracket.rate;
            break;
        }
        previousLimit = bracket.limit;
    }

    return Math.max(0, tax);
}

/**
 * Calculate Oregon state income tax using 2025 brackets (single filer)
 *
 * Oregon allows federal itemized deductions OR state standard deduction (whichever is greater)
 *
 * @param {number} agi - Adjusted Gross Income
 * @param {number} federalItemizedTotal - Total federal itemized deductions
 * @param {number} year - Tax year (for future bracket inflation)
 *
 * @returns {Object}
 * @returns {number} return.tax - Oregon income tax
 * @returns {number} return.oregonDeduction - Deduction used (itemized or standard)
 * @returns {string} return.oregonDeductionType - 'itemized' or 'standard'
 */
function calculateOregonTax(agi, federalItemizedTotal, year = 2026) {
    if (agi <= 0) return { tax: 0, oregonDeduction: 0, oregonDeductionType: 'n/a' };

    // Oregon 2025 standard deduction (single filer)
    const OR_STANDARD_DEDUCTION = 2605;

    // Oregon taxpayers can choose:
    // 1. Federal itemized deductions (regardless of whether they used it federally)
    // 2. Oregon standard deduction
    // Use whichever is greater
    const useOregonItemized = federalItemizedTotal > OR_STANDARD_DEDUCTION;
    const oregonDeduction = useOregonItemized ? federalItemizedTotal : OR_STANDARD_DEDUCTION;
    const oregonDeductionType = useOregonItemized ? 'itemized' : 'standard';

    // Calculate taxable income after deduction
    const taxableIncome = Math.max(0, agi - oregonDeduction);

    if (taxableIncome === 0) {
        return {
            tax: 0,
            oregonDeduction,
            oregonDeductionType
        };
    }

    // Oregon 2025 tax brackets (single filer)
    const brackets = [
        { limit: 4300, rate: 0.0475, base: 0 },
        { limit: 10750, rate: 0.0675, base: 204.25 },
        { limit: 125000, rate: 0.0875, base: 639.63 },
        { limit: Infinity, rate: 0.099, base: 10637.50 }
    ];

    // Find applicable bracket
    let tax = 0;
    let previousLimit = 0;

    for (const bracket of brackets) {
        if (taxableIncome <= bracket.limit) {
            tax = bracket.base + (taxableIncome - previousLimit) * bracket.rate;
            break;
        }
        previousLimit = bracket.limit;
    }

    return {
        tax: Math.max(0, tax),
        oregonDeduction,
        oregonDeductionType
    };
}

/**
 * Calculate combined federal and Oregon taxes
 *
 * This is the main function for Phase F DP optimizer.
 *
 * @param {Object} params
 * @param {number} params.agi - Adjusted Gross Income
 * @param {number} params.federalDeduction - Federal deduction (standard or itemized)
 * @param {number} params.federalItemizedTotal - Total federal itemized deductions (for Oregon calculation)
 * @param {number} params.year - Tax year
 *
 * @returns {Object}
 * @returns {number} return.federalTax - Federal income tax
 * @returns {number} return.oregonTax - Oregon income tax
 * @returns {number} return.totalTax - Combined federal + state tax
 * @returns {number} return.federalDeduction - Federal deduction used
 * @returns {number} return.oregonDeduction - Oregon deduction used
 * @returns {string} return.oregonDeductionType - 'itemized' or 'standard'
 * @returns {number} return.effectiveTaxRate - Total tax / AGI
 * @returns {number} return.marginalFederalRate - Approximate marginal federal rate
 * @returns {number} return.marginalOregonRate - Approximate marginal Oregon rate
 * @returns {number} return.marginalCombinedRate - Combined marginal rate
 */
function calculateTaxes({
    agi,
    federalDeduction,
    federalItemizedTotal,
    year = 2026
}) {
    // Validate inputs
    if (typeof agi !== 'number') {
        throw new Error('Invalid agi: must be number');
    }

    const federalTax = calculateFederalTax(agi, federalDeduction, year);
    const oregonResult = calculateOregonTax(agi, federalItemizedTotal, year);
    const totalTax = federalTax + oregonResult.tax;

    // Calculate effective and marginal rates
    const effectiveTaxRate = agi > 0 ? (totalTax / agi) : 0;

    // Marginal rates (approximate based on AGI)
    // Federal: 10%, 12%, 22%, 24%
    const marginalFederalRate =
        agi > 103350 ? 0.24 :
        agi > 48475 ? 0.22 :
        agi > 11925 ? 0.12 : 0.10;

    // Oregon: 4.75%, 6.75%, 8.75%, 9.9%
    const marginalOregonRate =
        agi > 125000 ? 0.099 :
        agi > 10750 ? 0.0875 :
        agi > 4300 ? 0.0675 : 0.0475;

    const marginalCombinedRate = marginalFederalRate + marginalOregonRate;

    return {
        federalTax,
        oregonTax: oregonResult.tax,
        totalTax,
        federalDeduction,
        oregonDeduction: oregonResult.oregonDeduction,
        oregonDeductionType: oregonResult.oregonDeductionType,
        effectiveTaxRate,
        marginalFederalRate,
        marginalOregonRate,
        marginalCombinedRate
    };
}

module.exports = {
    calculateTaxes,
    calculateFederalTax,
    calculateOregonTax
};

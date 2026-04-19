/**
 * Calculate effective tax rate (actual rate paid vs marginal bracket rate)
 *
 * @WHY Marginal tax bracket rate ("I'm in the 22% bracket") is invisible in current
 *      output, making it impossible to analyze the gap between marginal rate and
 *      effective rate (actual taxes paid / AGI). This extraction enables:
 *      - Strategic bracket harvesting analysis (proactive IRA withdrawals to "fill up" lower brackets)
 *      - Roth conversion opportunity identification (convert when effective rate is low)
 *      - IRMAA threshold planning (understanding true tax burden when crossing Medicare cliffs)
 *
 * @DECISION Calculates simple effective rate formula: (totalTax / AGI) * 100
 *           Returns rate as percentage for display purposes (e.g., 18.5 means 18.5%).
 *           Handles edge cases (zero AGI, zero tax) by returning 0% instead of NaN/Infinity.
 *
 * @LIMITATION Does NOT calculate marginal bracket rate (that requires separate federal/state
 *             bracket lookup). Does NOT account for IRMAA surcharges (Medicare Part B/D premiums).
 *             Does NOT include payroll taxes (FICA/Medicare) - only income taxes (federal + state).
 *
 * @param {number} totalTax - Combined federal + state income tax
 * @param {number} agi - Adjusted Gross Income
 * @returns {object} Effective tax rate calculation results
 *   @property {number} effectiveTaxRate - Percentage of AGI paid in taxes (0-100)
 *   @property {number} totalTax - Total tax amount (for reference)
 *   @property {number} agi - AGI amount (for reference)
 */
module.exports = function _calculateEffectiveTaxRate(totalTax, agi) {
    // Handle edge cases
    if (agi === 0 || totalTax === 0) {
        return {
            effectiveTaxRate: 0,
            totalTax,
            agi
        };
    }

    // Calculate effective rate as percentage
    const effectiveTaxRate = (totalTax / agi) * 100;

    return {
        effectiveTaxRate,
        totalTax,
        agi
    };
};

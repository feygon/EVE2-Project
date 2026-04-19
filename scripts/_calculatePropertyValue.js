/**
 * Property Value Calculation Module
 *
 * Calculates property appreciation and updates property values for projection years.
 * Extracted from NickersonCallbacks.js (Phase B: Separation of Concerns)
 *
 * @module _calculatePropertyValue
 */

/**
 * Calculate property appreciation for a single year
 *
 * @param {Object} params
 * @param {number} params.houseValue - Current primary house market value
 * @param {number} params.condoValue - Current condo market value
 * @param {number} params.houseAppreciationRate - Annual appreciation rate for house (decimal, e.g., 0.06 for 6%)
 * @param {number} params.condoAppreciationRate - Annual appreciation rate for condo (decimal, e.g., 0.05 for 5%)
 * @param {boolean} params.condoSold - Whether the condo has been sold (if true, appreciation = 0)
 *
 * @returns {Object} Property appreciation and totals
 * @returns {number} return.house_appreciation - Dollar amount of house appreciation this year
 * @returns {number} return.condo_appreciation - Dollar amount of condo appreciation this year (0 if sold)
 * @returns {number} return.total_appreciation - Total appreciation across all properties
 * @returns {number} return.real_estate_total - Total real estate value (before appreciation)
 * @returns {number} return.new_house_value - House value after applying appreciation
 * @returns {number} return.new_condo_value - Condo value after applying appreciation (unchanged if sold)
 */
function calculatePropertyValue({
    houseValue,
    condoValue,
    houseAppreciationRate,
    condoAppreciationRate,
    condoSold = false
}) {
    // Validate inputs
    if (typeof houseValue !== 'number' || houseValue < 0) {
        throw new Error('Invalid houseValue: must be non-negative number');
    }
    if (typeof condoValue !== 'number' || condoValue < 0) {
        throw new Error('Invalid condoValue: must be non-negative number');
    }
    if (typeof houseAppreciationRate !== 'number') {
        throw new Error('Invalid houseAppreciationRate: must be number');
    }
    if (typeof condoAppreciationRate !== 'number') {
        throw new Error('Invalid condoAppreciationRate: must be number');
    }

    // Calculate appreciation amounts for current year
    const house_appreciation = houseValue * houseAppreciationRate;
    const condo_appreciation = condoSold ? 0 : (condoValue * condoAppreciationRate);
    const total_appreciation = house_appreciation + condo_appreciation;

    // Current total before appreciation
    const real_estate_total = houseValue + condoValue;

    // Calculate new values for next year
    const new_house_value = houseValue * (1 + houseAppreciationRate);
    const new_condo_value = condoSold ? condoValue : (condoValue * (1 + condoAppreciationRate));

    return {
        house_appreciation,
        condo_appreciation,
        total_appreciation,
        real_estate_total,
        new_house_value,
        new_condo_value
    };
}

module.exports = {
    calculatePropertyValue
};

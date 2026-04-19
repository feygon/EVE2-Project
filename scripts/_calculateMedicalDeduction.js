/**
 * Calculate deductible medical expenses based on IRS 7.5% AGI floor rule
 *
 * @WHY Medical expense deduction logic was embedded in _calculateItemizedDeductions(),
 *      making it invisible how care status (base/LTC/memory care) drives medical costs
 *      and tax deductions. This extraction enables:
 *      - Strategic analysis of AGI manipulation (lower AGI = more deductible medical)
 *      - Visibility into how medical expenses scale with care progression
 *      - P0 bug prevention: tracks BOTH deductible medical (tax) AND total medical (cash outflow)
 *
 * @DECISION Four-tier medical expense model matches Person A's care progression:
 *           - Base tier: $200/month ($2,400/year) - routine healthcare before LTC trigger
 *           - At-home nursing (low): $30,000/year - starts at LTC trigger year
 *           - At-home nursing (high): $70,000/year - starts at midpoint between LTC trigger and memory care
 *           - Memory care tier: Inflated memory care amount (~$177k in 2034)
 *
 *           Nursing replaces base medical (no overlap).
 *
 *           Returns BOTH total medical expenses (cash outflow) and deductible medical (tax benefit).
 *           This prevents P0 bug where only deduction was calculated but money wasn't spent.
 *
 * @LIMITATION Does NOT include other medical deductibles (dental, vision, prescriptions not
 *             covered by Medicare Part D). Assumes memory care amount is 100% deductible
 *             (qualified medical expense). Does NOT model HSA contributions/withdrawals.
 *
 * @param {number} agi - Adjusted Gross Income for the year
 * @param {number} memoryCareAmount - Inflated memory care facility cost (if applicable)
 * @param {boolean} ltcTriggered - Whether LTC benefits have been triggered (2+ ADL failures)
 * @param {boolean} inMemoryCare - Whether Person A is in memory care facility
 * @param {object} scenario - Scenario configuration (contains medical_base_monthly, ltc_trigger_year, memory_care_year)
 * @param {number} year - Current projection year
 * @returns {object} Medical expense calculation results
 *   @property {number} medicalExpenses - Total medical expenses (cash outflow from pool)
 *   @property {number} medicalThreshold - IRS 7.5% AGI floor (non-deductible portion)
 *   @property {number} deductibleMedical - Amount deductible above AGI floor
 *   @property {string} medicalTier - Which tier applies: 'base', 'nursing_low', 'nursing_high', 'memory_care'
 *   @property {string|null} nursingTier - 'low', 'high', or null (for UI display)
 */
const { TAX_CONSTANTS } = require('./constants');

module.exports = function _calculateMedicalDeduction(agi, memoryCareAmount, ltcTriggered, inMemoryCare, scenario, year) {
    // Medical expenses (4 tiers based on care progression)
    let medicalExpenses = 0;
    let medicalTier = '';
    let nursingTier = null;
    const baseMedicalMonthly = scenario.medical_base_monthly || 200; // Default $200/mo

    if (inMemoryCare) {
        // In memory care: medical = inflated memory care amount
        medicalExpenses = memoryCareAmount;
        medicalTier = 'memory_care';
    } else if (ltcTriggered) {
        // Determine low vs high nursing tier based on midpoint
        const ltcTriggerYear = scenario.ltc_trigger_year;
        const memoryCareYear = scenario.memory_care_year;

        if (ltcTriggerYear && memoryCareYear && year) {
            const nursingYears = memoryCareYear - ltcTriggerYear;

            if (nursingYears <= 1) {
                // 0 or 1 year gap: all nursing years are low tier
                medicalExpenses = scenario.nursing_low_cost || TAX_CONSTANTS.nursing.lowAnnual;
                medicalTier = 'nursing_low';
                nursingTier = 'low';
            } else {
                const intensifyYear = ltcTriggerYear + Math.floor(nursingYears / 2);
                if (year >= intensifyYear) {
                    medicalExpenses = scenario.nursing_high_cost || TAX_CONSTANTS.nursing.highAnnual;
                    medicalTier = 'nursing_high';
                    nursingTier = 'high';
                } else {
                    medicalExpenses = scenario.nursing_low_cost || TAX_CONSTANTS.nursing.lowAnnual;
                    medicalTier = 'nursing_low';
                    nursingTier = 'low';
                }
            }
        } else {
            // Fallback: no year info available, use low tier
            medicalExpenses = scenario.nursing_low_cost || TAX_CONSTANTS.nursing.lowAnnual;
            medicalTier = 'nursing_low';
            nursingTier = 'low';
        }
    } else {
        // Base tier: $200/mo = $2,400/year
        medicalExpenses = baseMedicalMonthly * 12;
        medicalTier = 'base';
    }

    // Medical expenses only deductible above 7.5% of AGI
    const medicalThreshold = agi * 0.075;
    const deductibleMedical = Math.max(0, medicalExpenses - medicalThreshold);

    return {
        medicalExpenses,
        medicalThreshold,
        deductibleMedical,
        medicalTier,
        nursingTier
    };
};

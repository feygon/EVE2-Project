/**
 * Calculate Social Security taxability using IRS Publication 915 graduated formula
 *
 * @WHY During memory care years, Person A's gross income drops significantly because
 *      lifestyle is covered by the facility (tax-deductible medical) instead of IRA
 *      withdrawals. This can push provisional income from the 85% tier down toward
 *      the 50% tier or near threshold boundaries. The graduated calculation matters
 *      most at these boundaries — the difference between taxing $125 of SS vs $15,000+.
 *
 * @DECISION Implements IRS Publication 915 graduated formula (single filer, widow):
 *
 *   Step 1: Provisional income = other income + 50% of SS + tax-exempt interest
 *           (Excludes taxable SS — this is why there's no circular dependency)
 *
 *   Step 2: Compare to thresholds:
 *           Below $25,000: $0 taxable
 *           $25,000–$34,000: lesser of (50% of benefits) or (50% of excess over $25k)
 *           Above $34,000: lesser of (85% of benefits) or ($4,500 + 85% of excess over $34k)
 *
 *   Step 3: Result is a fixed dollar amount added to Form 1040. No loop.
 *
 *   The $4,500 in the 85% formula = 50% of ($34,000 - $25,000) = max from the 50% tier.
 *
 * @param {number} ssdAmount - Social Security annual benefit
 * @param {number} otherIncome - Non-SS income (IRA withdrawals, rental income, wages, etc.)
 * @param {number} taxExemptInterest - Tax-exempt interest income (municipal bonds, etc.), default 0
 * @returns {object} SSDI taxability calculation results
 *   @property {number} ssdAmount - Original SS benefit amount
 *   @property {number} provisionalIncome - IRS provisional income used for tier determination
 *   @property {number} taxableFraction - Effective fraction of SS that is taxable (0 to 0.85)
 *   @property {number} taxableSS - Dollar amount of SS that is taxable
 *   @property {string} tier - Which tier applies: 'tier_0_none', 'tier_50_percent', 'tier_85_percent'
 */
module.exports = function _calculateSSDITaxability(ssdAmount, otherIncome, taxExemptInterest = 0) {
    // Step 1: Calculate provisional income per IRS Publication 915
    // Uses 50% of SS benefits — NOT the taxable portion (avoids circular dependency)
    const provisionalIncome = otherIncome + (ssdAmount * 0.5) + taxExemptInterest;

    // Single filer thresholds (Person A is a widow)
    const THRESHOLD_50 = 25000;
    const THRESHOLD_85 = 34000;

    let taxableSS = 0;
    let tier = '';

    if (provisionalIncome < THRESHOLD_50) {
        // Tier 0: No SS benefits are taxable
        taxableSS = 0;
        tier = 'tier_0_none';

    } else if (provisionalIncome < THRESHOLD_85) {
        // Tier 50: IRS graduated formula
        // Taxable SS = lesser of:
        //   (a) 50% of total benefits
        //   (b) 50% of (provisional income - $25,000)
        const fiftyPctBenefits = ssdAmount * 0.50;
        const fiftyPctExcess = (provisionalIncome - THRESHOLD_50) * 0.50;
        taxableSS = Math.min(fiftyPctBenefits, fiftyPctExcess);
        tier = 'tier_50_percent';

    } else {
        // Tier 85: IRS graduated formula
        // Taxable SS = lesser of:
        //   (a) 85% of total benefits
        //   (b) $4,500 + 85% of (provisional income - $34,000)
        //
        // The $4,500 = max taxable from 50% tier = 50% of ($34k - $25k)
        const eightyFivePctBenefits = ssdAmount * 0.85;
        const maxFrom50PctTier = (THRESHOLD_85 - THRESHOLD_50) * 0.50; // = $4,500
        const eightyFivePctExcess = (provisionalIncome - THRESHOLD_85) * 0.85;
        taxableSS = Math.min(eightyFivePctBenefits, maxFrom50PctTier + eightyFivePctExcess);
        tier = 'tier_85_percent';
    }

    // Taxable SS can never be negative
    taxableSS = Math.max(0, taxableSS);

    // Calculate effective fraction for reporting
    const taxableFraction = ssdAmount > 0 ? taxableSS / ssdAmount : 0;

    return {
        ssdAmount,
        provisionalIncome,
        taxableFraction,
        taxableSS,
        tier
    };
};

/**
 * @file _calculateCapitalGains.js
 * @description Calculate capital gains tax on real estate sales.
 *
 * @DECISION MAPT scenarios get stepped-up basis via LPOA — zero capital gains.
 *   Non-MAPT scenarios pay LTCG + Oregon income tax + NIIT on appreciation.
 *   Primary residence exclusion ($250k single) applies if Person A lived there
 *   2 of the last 5 years — but the condo is NOT the primary residence (Person A
 *   lives in the primary house). So no exclusion applies to condo sales.
 *
 * @DECISION Primary house sale at death gets stepped-up basis in ALL scenarios
 *   (inherited property), so no capital gains on the house. This module only
 *   handles condo sales during the projection.
 */

const { TAX_CONSTANTS } = require('./constants');

/**
 * Calculate capital gains tax on a property sale.
 *
 * @param {number} saleProceeds - Net sale proceeds (after closing costs)
 * @param {number} costBasis - Original purchase price / cost basis
 * @param {boolean} isMAPT - Whether this is a MAPT scenario (stepped-up basis = no tax)
 * @param {number} otherIncome - Person A's other taxable income this year (for NIIT threshold)
 * @returns {Object} { gain, federalTax, oregonTax, niit, totalTax, effectiveRate }
 */
function calculateCapitalGainsTax(saleProceeds, costBasis, isMAPT, otherIncome) {
    // MAPT: stepped-up basis via LPOA — no capital gains tax
    if (isMAPT) {
        return { gain: 0, federalTax: 0, oregonTax: 0, niit: 0, totalTax: 0, effectiveRate: 0 };
    }

    const gain = Math.max(0, saleProceeds - costBasis);
    if (gain === 0) {
        return { gain: 0, federalTax: 0, oregonTax: 0, niit: 0, totalTax: 0, effectiveRate: 0 };
    }

    // Federal LTCG (15% for income above $44,626 single — Person A always qualifies)
    const federalTax = Math.round(gain * TAX_CONSTANTS.federal.ltcgRate);

    // Oregon taxes capital gains as ordinary income at top marginal rate
    // Person A's income + gain pushes well into the 9.9% bracket
    const oregonRate = 0.099; // Top Oregon bracket (simplified — gain is large enough)
    const oregonTax = Math.round(gain * oregonRate);

    // NIIT: 3.8% on investment income when MAGI > $200k
    let niit = 0;
    const magi = otherIncome + gain;
    if (magi > TAX_CONSTANTS.federal.niitThreshold) {
        // NIIT applies to the lesser of: net investment income or MAGI excess over threshold
        const magiExcess = magi - TAX_CONSTANTS.federal.niitThreshold;
        niit = Math.round(Math.min(gain, magiExcess) * TAX_CONSTANTS.federal.niitRate);
    }

    const totalTax = federalTax + oregonTax + niit;
    const effectiveRate = gain > 0 ? totalTax / gain : 0;

    return {
        gain: Math.round(gain),
        federalTax,
        oregonTax,
        niit,
        totalTax,
        effectiveRate: Math.round(effectiveRate * 1000) / 1000
    };
}

module.exports = { calculateCapitalGainsTax };

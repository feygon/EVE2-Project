/**
 * Condo Sale Calculation Module
 *
 * Calculates net proceeds from selling Arbor Roses condo, including:
 * - Selling costs
 * - Capital gains calculation
 * - Capital gains tax (federal + Oregon)
 * - Net proceeds after all costs and taxes
 *
 * Extracted from NickersonCallbacks.js (Phase B: Separation of Concerns)
 *
 * CRITICAL: Per PROPERTY-CHEAT-SHEET.md:
 * - The condo being sold is ARBOR ROSES (no mortgage)
 * - This is NOT the SNT condo (C2 lives there)
 * - Arbor Roses original cost basis: $400,000 (stepped-up basis from 2019)
 * - ScA_MAPT scenario only (condo_disposition = 'trust_mapt')
 *
 * @module _calculateCondoSale
 */

const { TAX_CONSTANTS } = require('./constants');

/**
 * Calculate capital gains tax on long-term capital gains
 *
 * Uses 2025 tax brackets for long-term capital gains (0%, 15%, 20%)
 * Plus Oregon state capital gains tax (same as ordinary income rates)
 *
 * @param {number} capitalGains - Long-term capital gains amount
 * @param {number} ordinaryIncome - AGI from ordinary income (for bracket calculation)
 * @param {boolean} isMarried - Whether filing status is married (affects brackets)
 *
 * @returns {Object}
 * @returns {number} return.federalCapitalGainsTax - Federal capital gains tax
 * @returns {number} return.oregonCapitalGainsTax - Oregon capital gains tax
 * @returns {number} return.totalCapitalGainsTax - Total capital gains tax
 */
function calculateCapitalGainsTax(capitalGains, ordinaryIncome, isMarried = false) {
    if (capitalGains <= 0) {
        return {
            federalCapitalGainsTax: 0,
            oregonCapitalGainsTax: 0,
            totalCapitalGainsTax: 0
        };
    }

    // 2025 Long-Term Capital Gains Brackets (Single filer)
    // 0% up to $47,025
    // 15% from $47,025 to $518,900
    // 20% above $518,900
    const LTCG_BRACKETS = [
        { threshold: 0, rate: 0.00 },
        { threshold: 47025, rate: 0.15 },
        { threshold: 518900, rate: 0.20 }
    ];

    // Calculate total taxable income (ordinary + capital gains)
    const totalIncome = ordinaryIncome + capitalGains;

    let federalCapitalGainsTax = 0;
    let remainingGains = capitalGains;
    let currentIncome = ordinaryIncome;

    // Step through brackets
    for (let i = LTCG_BRACKETS.length - 1; i >= 0; i--) {
        const bracket = LTCG_BRACKETS[i];
        const nextThreshold = i > 0 ? LTCG_BRACKETS[i - 1].threshold : 0;

        if (totalIncome > bracket.threshold) {
            // How much income is in this bracket?
            const incomeInBracket = Math.min(
                totalIncome - bracket.threshold,
                currentIncome + remainingGains - bracket.threshold
            );

            // How much of the capital gains falls in this bracket?
            const gainsInBracket = Math.max(0, Math.min(
                remainingGains,
                totalIncome - Math.max(currentIncome, bracket.threshold)
            ));

            federalCapitalGainsTax += gainsInBracket * bracket.rate;
            remainingGains -= gainsInBracket;

            if (remainingGains <= 0) break;
        }
    }

    // Oregon taxes capital gains as ordinary income
    // Using marginal rate approximation (Phase B: full calculation in _calculateTaxes.js)
    // Oregon 2025 brackets: 4.75%, 6.75%, 8.75%, 9.9% (top bracket at $125k+)
    const oregonMarginalRate = ordinaryIncome > 125000 ? 0.099 :
                               ordinaryIncome > 62500 ? 0.0875 :
                               ordinaryIncome > 31500 ? 0.0675 : 0.0475;

    const oregonCapitalGainsTax = capitalGains * oregonMarginalRate;

    return {
        federalCapitalGainsTax,
        oregonCapitalGainsTax,
        totalCapitalGainsTax: federalCapitalGainsTax + oregonCapitalGainsTax
    };
}

/**
 * Calculate net proceeds from condo sale
 *
 * @param {Object} params
 * @param {number} params.condoMarketValue - Current market value of condo
 * @param {number} params.costBasis - Original cost basis (stepped-up basis, default $400,000)
 * @param {number} params.sellingCosts - Total selling costs (default $20,000 per owner spec)
 * @param {number} params.ordinaryIncome - AGI from ordinary income this year (for cap gains tax bracket)
 * @param {boolean} params.isMarried - Filing status (default false = single)
 *
 * @returns {Object} Condo sale breakdown
 * @returns {number} return.marketValue - Condo market value
 * @returns {number} return.costBasis - Original cost basis
 * @returns {number} return.sellingCosts - Selling costs (including deferred maintenance)
 * @returns {number} return.grossProceeds - Market value
 * @returns {number} return.capitalGains - Gross proceeds - cost basis - selling costs
 * @returns {number} return.federalCapitalGainsTax - Federal capital gains tax
 * @returns {number} return.oregonCapitalGainsTax - Oregon capital gains tax
 * @returns {number} return.totalCapitalGainsTax - Total capital gains tax
 * @returns {number} return.netProceeds - Amount available after all costs and taxes
 * @returns {number} return.effectiveTaxRate - Total tax as % of capital gains
 */
function calculateCondoSale({
    condoMarketValue,
    costBasis = 400000,
    sellingCosts = 20000,
    ordinaryIncome = 0,
    isMarried = false
}) {
    // Validate inputs
    if (typeof condoMarketValue !== 'number' || condoMarketValue <= 0) {
        throw new Error('Invalid condoMarketValue: must be positive number');
    }
    if (typeof costBasis !== 'number' || costBasis < 0) {
        throw new Error('Invalid costBasis: must be non-negative number');
    }
    if (typeof sellingCosts !== 'number' || sellingCosts < 0) {
        throw new Error('Invalid sellingCosts: must be non-negative number');
    }

    // Gross proceeds = market value
    const grossProceeds = condoMarketValue;

    // Capital gains = gross proceeds - cost basis - selling costs
    const capitalGains = Math.max(0, grossProceeds - costBasis - sellingCosts);

    // Calculate capital gains tax
    const taxCalc = calculateCapitalGainsTax(capitalGains, ordinaryIncome, isMarried);

    // Net proceeds = gross proceeds - selling costs - capital gains tax
    const netProceeds = grossProceeds - sellingCosts - taxCalc.totalCapitalGainsTax;

    // Effective tax rate on gains
    const effectiveTaxRate = capitalGains > 0 ? (taxCalc.totalCapitalGainsTax / capitalGains) : 0;

    return {
        marketValue: condoMarketValue,
        costBasis,
        sellingCosts,
        grossProceeds,
        capitalGains,
        federalCapitalGainsTax: taxCalc.federalCapitalGainsTax,
        oregonCapitalGainsTax: taxCalc.oregonCapitalGainsTax,
        totalCapitalGainsTax: taxCalc.totalCapitalGainsTax,
        netProceeds,
        effectiveTaxRate
    };
}

module.exports = {
    calculateCondoSale,
    calculateCapitalGainsTax
};

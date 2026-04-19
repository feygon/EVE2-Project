/**
 * @file _calculateTaxCost.js
 * @description Pure tax cost function for the withdrawal optimizer.
 *   Given a year and IRA withdrawal amount, computes the total tax burden
 *   including federal, Oregon, IRMAA surcharge, and SS taxability effects.
 *
 *   This module is stateless — all context is passed via the `params` object.
 *   It does NOT modify any external state or yearData.
 *
 * @DECISION Brackets frozen at 2025/2026 values for full projection horizon.
 *   Bracket indexing would add ~3% accuracy over 15 years but doubles the
 *   parameter surface. The optimizer's relative decisions (IRA vs LTC) are
 *   insensitive to uniform bracket inflation.
 */

const { TAX_CONSTANTS } = require('./constants');
const _calculateSSDITaxability = require('./_calculateSSDITaxability');

/**
 * Apply progressive tax brackets to taxable income.
 * @param {number} taxable - Taxable income
 * @param {Array} brackets - Array of { limit, rate, base }
 * @returns {number} Tax amount
 */
function applyBrackets(taxable, brackets) {
    if (taxable <= 0) return 0;
    for (let i = brackets.length - 1; i >= 0; i--) {
        const prevLimit = i > 0 ? brackets[i - 1].limit : 0;
        if (taxable > prevLimit) {
            return brackets[i].base + (taxable - prevLimit) * brackets[i].rate;
        }
    }
    return 0;
}

/**
 * Look up IRMAA surcharge for a given MAGI.
 * @param {number} magi - Modified Adjusted Gross Income
 * @returns {{ surcharge: number, tier: number, headroom: number }} IRMAA result
 *   headroom = dollars remaining before the next tier threshold
 */
function lookupIRMAA(magi) {
    const tiers = TAX_CONSTANTS.federal.irmaaTiers2026;
    let tier = 0;
    let surcharge = 0;

    for (let t = tiers.length - 1; t >= 0; t--) {
        if (magi >= tiers[t].threshold) {
            tier = t;
            surcharge = Math.round((tiers[t].partB + tiers[t].partD) * 12);
            break;
        }
    }

    // Headroom: how much MAGI can increase before hitting the next tier
    let headroom = Infinity;
    if (tier < tiers.length - 1) {
        headroom = tiers[tier + 1].threshold - magi;
    }

    return { surcharge, tier, headroom };
}

/**
 * @typedef {Object} TaxCostParams
 * @property {number} socialSecurity      - Annual SS/SSDI benefit (COLA-adjusted)
 * @property {number} rentalIncome        - Rental income on Person A's 1040 (0 for MAPT)
 * @property {number} medicalExpenses     - Actual medical/care expenses (for itemized deduction)
 * @property {number} mortgageInterest    - Deductible mortgage interest
 * @property {number} propertyTax         - Property taxes (subject to SALT cap)
 * @property {number} magi2YearsPrior     - MAGI from 2 years ago (for IRMAA lookup)
 * @property {number} [taxExemptInterest] - Tax-exempt interest (default 0)
 */

/**
 * @typedef {Object} TaxCostResult
 * @property {number} federalTax    - Federal income tax (Form 1040)
 * @property {number} oregonTax     - Oregon state income tax (OR-40)
 * @property {number} irmaaSurcharge - IRMAA Medicare surcharge (based on 2yr-prior MAGI)
 * @property {number} totalCost     - federalTax + oregonTax + irmaaSurcharge
 * @property {number} agi           - Adjusted Gross Income
 * @property {number} magi          - MAGI for this year (= AGI for Person A)
 * @property {number} taxableSS     - Dollar amount of SS that is taxable
 * @property {string} ssTier        - SS taxability tier ('tier_0_none', 'tier_50_percent', 'tier_85_percent')
 * @property {number} effectiveRate - Total tax / AGI (as decimal, e.g. 0.185)
 * @property {number} marginalRate  - Approximate marginal rate at this withdrawal level
 * @property {number} irmaaHeadroom - Dollars before next IRMAA tier threshold
 * @property {number} irmaaTier     - Current IRMAA tier (0-5)
 * @property {boolean} washActive   - Medical deduction exceeds 7.5% AGI floor
 * @property {number} washLimit     - Max IRA withdrawal where medical deduction fully shelters income
 * @property {string} deductionType - 'standard' or 'itemized'
 */

/**
 * Calculate the total tax cost for a given IRA withdrawal amount.
 *
 * @param {number} year - Projection year
 * @param {number} iraWithdrawal - IRA withdrawal amount (the optimizer's decision variable)
 * @param {TaxCostParams} params - Year-specific known values
 * @returns {TaxCostResult}
 */
function calculateTaxCost(year, iraWithdrawal, params) {
    const {
        socialSecurity = 0,
        rentalIncome = 0,
        medicalExpenses = 0,
        mortgageInterest = 0,
        propertyTax = 0,
        charitableContributions = 0,
        magi2YearsPrior = 0,
        taxExemptInterest = 0
    } = params;

    // Other income (non-SS)
    const otherIncome = rentalIncome + iraWithdrawal;

    // SS taxability (graduated formula, not hardcoded 85%)
    const ssResult = _calculateSSDITaxability(socialSecurity, otherIncome, taxExemptInterest);

    // AGI = taxable SS + other income
    const agi = ssResult.taxableSS + otherIncome;

    // MAGI (same as AGI for Person A — no muni bonds or foreign income)
    const magi = agi;

    // === Itemized deductions ===
    // Medical: only expenses exceeding 7.5% AGI floor
    const medicalFloor = agi * 0.075;
    const medicalDeduction = Math.max(0, medicalExpenses - medicalFloor);
    const washActive = medicalDeduction > 0;

    // SALT: property taxes capped at $10k
    const saltDeduction = Math.min(propertyTax, TAX_CONSTANTS.federal.saltCap);

    // Total itemized (including charitable contributions)
    const itemized = medicalDeduction + saltDeduction + mortgageInterest + charitableContributions;

    // Choose higher of itemized vs standard
    const standardDeduction = TAX_CONSTANTS.federal.standardDeduction2026;
    const federalDeduction = Math.max(itemized, standardDeduction);
    const deductionType = itemized > standardDeduction ? 'itemized' : 'standard';

    // === Federal tax (1040) ===
    const federalTaxable = Math.max(0, agi - federalDeduction);
    const federalTax = applyBrackets(federalTaxable, TAX_CONSTANTS.federal.brackets);

    // === Oregon tax (OR-40, separate deduction) ===
    // Oregon can itemize independently of federal choice
    const oregonDeduction = Math.max(itemized, TAX_CONSTANTS.oregon.standardDeduction);
    const oregonTaxable = Math.max(0, agi - oregonDeduction);
    const oregonTax = applyBrackets(oregonTaxable, TAX_CONSTANTS.oregon.brackets);

    // === IRMAA (based on MAGI from 2 years prior) ===
    const irmaaResult = lookupIRMAA(magi2YearsPrior);

    // === Total cost ===
    const totalCost = federalTax + oregonTax + irmaaResult.surcharge;

    // === Effective rate ===
    const effectiveRate = agi > 0 ? totalCost / agi : 0;

    // === Marginal rate (numerical: tax at W+$1000 minus tax at W, per $1000) ===
    let marginalRate = 0;
    if (iraWithdrawal >= 0) {
        const bump = 1000;
        const bumpOtherIncome = rentalIncome + iraWithdrawal + bump;
        const bumpSS = _calculateSSDITaxability(socialSecurity, bumpOtherIncome, taxExemptInterest);
        const bumpAGI = bumpSS.taxableSS + bumpOtherIncome;
        const bumpMedDeduction = Math.max(0, medicalExpenses - bumpAGI * 0.075);
        const bumpItemized = bumpMedDeduction + saltDeduction + mortgageInterest + charitableContributions;
        const bumpFedDeduction = Math.max(bumpItemized, standardDeduction);
        const bumpFedTaxable = Math.max(0, bumpAGI - bumpFedDeduction);
        const bumpFedTax = applyBrackets(bumpFedTaxable, TAX_CONSTANTS.federal.brackets);
        const bumpOrDeduction = Math.max(bumpItemized, TAX_CONSTANTS.oregon.standardDeduction);
        const bumpOrTaxable = Math.max(0, bumpAGI - bumpOrDeduction);
        const bumpOrTax = applyBrackets(bumpOrTaxable, TAX_CONSTANTS.oregon.brackets);
        marginalRate = (bumpFedTax + bumpOrTax - federalTax - oregonTax) / bump;
    }

    // === Medical wash limit ===
    // Max IRA withdrawal where medical deduction fully offsets: medical / 0.075 - fixedIncome
    const fixedIncome = ssResult.taxableSS + rentalIncome;
    const washLimit = medicalExpenses > 0
        ? Math.max(0, (medicalExpenses / 0.075) - fixedIncome)
        : 0;

    return {
        federalTax: Math.round(federalTax),
        oregonTax: Math.round(oregonTax),
        irmaaSurcharge: irmaaResult.surcharge,
        totalCost: Math.round(totalCost),
        agi: Math.round(agi),
        magi: Math.round(magi),
        taxableSS: Math.round(ssResult.taxableSS),
        ssTier: ssResult.tier,
        effectiveRate: Math.round(effectiveRate * 10000) / 10000,
        marginalRate: Math.round(marginalRate * 10000) / 10000,
        irmaaHeadroom: irmaaResult.headroom,
        irmaaTier: irmaaResult.tier,
        washActive,
        washLimit: Math.round(washLimit),
        deductionType
    };
}

module.exports = { calculateTaxCost, applyBrackets, lookupIRMAA };

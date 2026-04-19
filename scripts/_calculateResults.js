/**
 * @file Calculate Results
 * @summary Outcome summary and timeline annotations for projection results
 * @description Extracted from NickersonCallbacks._calculateOutcome and
 *   _projectionEngine.js annotations block.
 */

const { CASH_DEPLETED_RESULTS } = require('./constants');
const { calculateLTCPayout } = require('./_calculateYearIncome');

/**
 * Calculate outcome summary from projection years
 * @param {Array} years - Projected year data
 * @param {Object} scenario - Scenario configuration
 * @returns {Object|null} Outcome summary
 */
function calculateOutcome(years, scenario) {
    if (!years || years.length === 0) return null;

    const formatNum = (num) => Math.round(num || 0).toLocaleString('en-US');
    const passingYear = scenario.year_of_passing || years[years.length - 1].year;
    const memoryCareYear = scenario.memory_care_year;

    // Find year IRA depleted (both accounts = 0)
    let iraDepletedYear = null;
    for (const year of years) {
        if (year.total_ira_close <= 0) {
            iraDepletedYear = year.year;
            break;
        }
    }

    // Sum total taxes paid (income + capital gains)
    let totalFederalTax = 0;
    let totalStateTax = 0;
    let totalCapitalGainsTax = 0;
    for (const year of years) {
        totalFederalTax += year.expenses.federal_income_tax || 0;
        totalStateTax += year.expenses.oregon_income_tax || 0;
        if (year.capital_gains) {
            totalCapitalGainsTax += year.capital_gains.totalTax || 0;
        }
    }

    // Check if capital gains paid (real estate sold)
    const capitalGainsPaid = years.some(y => y.condo_sold);

    // Sum real estate liquidated by passing (includes HELOC draws)
    let realEstateLiquidated = 0;
    for (const year of years) {
        if (year.year > passingYear) break;
        if (year.condo_sale_proceeds) {
            realEstateLiquidated += year.condo_sale_proceeds;
        }
        if (year.heloc_drawn) {
            realEstateLiquidated += year.heloc_drawn;
        }
    }

    // Check for memory care risk (negative balance during facility stay)
    let memoryCareRisk = false;
    for (const year of years) {
        if (memoryCareYear && year.year >= memoryCareYear && year.year <= passingYear) {
            // Check if liquid assets went negative or real estate had to be liquidated (sale or HELOC)
            if (year.liquid_assets_total < 0 ||
                year.condo_sold ||
                year.heloc_drawn > 0) {
                memoryCareRisk = true;
                break;
            }
        }
    }

    // Calculate asset depletion risk level
    let assetDepletionRisk = 'cyan';  // Default: sustainable

    // Check if liquid assets ever hit zero or negative (red: depleted)
    const liquidAssetsDepletedYear = years.find(y => y.liquid_assets_total <= 0);
    const isMAPTScenario = (scenario.condo_disposition === 'trust_mapt');
    const maptLookbackClear = isMAPTScenario ? (scenario.trust_formation_year || 2026) + 5 : null;

    if (liquidAssetsDepletedYear) {
        // MAPT with lookback clear: magenta (crisis pivot available — Medicaid begins, assets protected)
        if (isMAPTScenario && maptLookbackClear && liquidAssetsDepletedYear.year >= maptLookbackClear) {
            assetDepletionRisk = 'magenta';
        } else {
            assetDepletionRisk = 'red';
        }
    } else {
        // Check for Medicaid protection scenario (magenta: low liquid assets but still have IRA)
        // This indicates need to divest IRA before Medicaid qualification
        const finalYear = years[years.length - 1];
        const liquidAssetsLow = finalYear.liquid_assets_total < 50000;  // Under $50k liquid
        const iraStillHasBalance = finalYear.total_ira_close > 100000;  // But IRA still > $100k

        if (liquidAssetsLow && iraStillHasBalance) {
            assetDepletionRisk = 'magenta';
        } else {
            // Check if assets are declining toward depletion (yellow: declining)
            const firstYear = years[0];
            const lastYear = years[years.length - 1];
            const liquidStart = firstYear.liquid_assets_total;
            const liquidEnd = lastYear.liquid_assets_total;
            const percentageDecline = (liquidStart - liquidEnd) / liquidStart;

            // If liquid assets declined by more than 50%, it's yellow (declining)
            if (percentageDecline > 0.5) {
                assetDepletionRisk = 'yellow';
            }
            // Otherwise stays cyan (sustainable)
        }
    }

    return {
        ira_depleted_year: iraDepletedYear,
        total_federal_tax: totalFederalTax,
        total_state_tax: totalStateTax,
        total_capital_gains_tax: totalCapitalGainsTax,
        capital_gains_paid: capitalGainsPaid,
        real_estate_liquidated: realEstateLiquidated,
        memory_care_risk: memoryCareRisk,
        passing_year: passingYear,
        asset_depletion_risk: assetDepletionRisk
    };
}

/**
 * Compute timeline annotations for detail view
 * @param {Object} params
 * @param {Array} params.years - Projected year data
 * @param {Object} params.scenario - Scenario configuration
 * @param {Object} params.ltcPolicy - LTC policy object
 * @param {number|null} params.condoSaleYear - Year condo is sold
 * @param {boolean} params.isMAPT - Whether scenario uses MAPT
 * @param {number|null} params.trustFormationYear - MAPT formation year
 * @param {number|null} params.lookbackClearYear - MAPT lookback clear year
 * @param {number|null} params.medicaidTriggerYear - Medicaid trigger year
 * @param {number} params.endYear - End year of projection
 * @returns {Object} Annotations object
 */
function calculateAnnotations(params) {
    const { years, scenario, ltcPolicy, condoSaleYear, isMAPT, trustFormationYear, lookbackClearYear, medicaidTriggerYear, endYear } = params;

    const ltcTriggerYear = scenario.ltc_trigger_year || null;
    const mcYear = scenario.memory_care_year || null;
    let nursingIntensifyYear = null;
    if (ltcTriggerYear && mcYear) {
        const nursingYears = mcYear - ltcTriggerYear;
        if (nursingYears > 1) {
            nursingIntensifyYear = ltcTriggerYear + Math.floor(nursingYears / 2);
        }
    }

    // Find cash depleted year (SDIRA + ManagedIRA + LTC Savings < $25k)
    let cashDepletedYear = null;
    let yearsInMemoryCareAtDepletion = null;
    for (const y of years) {
        const cashAssets = y.sdira_checking_close + y.managed_ira_close + y.ltc_savings_close;
        if (cashAssets < 25000) {
            cashDepletedYear = y.year;
            if (mcYear && y.year >= mcYear) {
                yearsInMemoryCareAtDepletion = y.year - mcYear;
            }
            break;
        }
    }

    // Compute LTC payout annual/daily for bracket label
    let ltcPayoutAnnual = null;
    let ltcPayoutDaily = null;
    if (ltcPolicy && ltcTriggerYear) {
        const annualPayout = calculateLTCPayout(ltcPolicy, ltcTriggerYear, ltcTriggerYear);
        if (annualPayout > 0) {
            ltcPayoutAnnual = Math.round(annualPayout);
            ltcPayoutDaily = Math.round(annualPayout / 365);
        }
    }

    // Determine cash-depleted scenario result enum
    let cashDepletedResult = null;
    if (cashDepletedYear) {
        if (scenario.condo_disposition === 'trust_mapt') {
            cashDepletedResult = CASH_DEPLETED_RESULTS.MEDICAID_BEGINS;
        } else {
            cashDepletedResult = CASH_DEPLETED_RESULTS.REAL_ESTATE_LIQUIDATION_IMMINENT;
        }
    }

    const annotations = {
        ltc_trigger_year: ltcTriggerYear,
        nursing_intensify_year: nursingIntensifyYear,
        memory_care_year: mcYear,
        year_of_passing: scenario.year_of_passing || endYear,
        ltc_payout_end_year: ltcTriggerYear ? Math.min(ltcTriggerYear + 3, scenario.year_of_passing || endYear) : null,
        cash_depleted_year: cashDepletedYear,
        cash_depleted_result: cashDepletedResult,
        years_in_memory_care_at_depletion: yearsInMemoryCareAtDepletion,
        ltc_payout_annual: ltcPayoutAnnual,
        ltc_payout_daily: ltcPayoutDaily,
        nursing_low_cost: scenario.nursing_low_cost || 30000,
        nursing_high_cost: scenario.nursing_high_cost || 70000,
        condo_sale_year: condoSaleYear || null,
        condo_sale_proceeds: condoSaleYear ? (years.find(y => y.year === condoSaleYear) || {}).condo_sale_proceeds || 0 : null,
        // MAPT-specific annotations
        trust_formation_year: isMAPT ? trustFormationYear : null,
        lookback_clear_year: isMAPT ? lookbackClearYear : null,
        crisis_pivot_ready: isMAPT ? (lookbackClearYear <= (scenario.year_of_passing || endYear) && (!cashDepletedYear || cashDepletedYear >= lookbackClearYear)) : null,
        // Medicaid trigger annotations (MAPT only)
        medicaid_trigger_year: medicaidTriggerYear,
        medicaid_pre_liquidation_year: medicaidTriggerYear ? medicaidTriggerYear - 1 : null,
        snt_funded_amount: isMAPT ? (years.find(y => y.snt_funded) || {}).snt_funded || 0 : null,
        // Roommate income annotation
        roommate_start_year: (isMAPT && scenario.roommate_enabled === 1 && scenario.memory_care_year) ? scenario.memory_care_year : null,
        roommate_monthly: (isMAPT && scenario.roommate_enabled === 1) ? (scenario.roommate_monthly || 1100) : null
    };

    return annotations;
}

module.exports = { calculateOutcome, calculateAnnotations };

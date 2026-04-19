/**
 * @file Calculate Metrics
 * @summary Overview metrics for scenario comparison cards
 * @description Extracted from NickersonCallbacks.js (Step 10 of refactor).
 */

/**
 * Calculate summary metrics from projection years for overview cards.
 * @param {Array} projections - Array of yearData objects from the projection engine
 * @returns {Object} Metrics including liquid assets, IRA tracking, LTC totals, RE values, trust balances
 */
function calculateMetrics(projections) {
    if (!projections || projections.length === 0) {
        return {
            liquid_assets_start: 0,
            liquid_assets_min: 0,
            liquid_assets_final: 0,
            ira_start: 0,
            ira_min: 0,
            ira_final: 0,
            ltc_total: 0
        };
    }

    // Find min values and years
    let liquidMin = projections[0].liquid_assets_total;
    let liquidMinYear = projections[0].year;
    let iraMin = projections[0].total_ira_close;
    let iraMinYear = projections[0].year;
    let ltcTotal = 0;
    let realEstateLiquidationYear = null;
    let realEstateLiquidationTotal = 0;
    let maxHelocBalance = 0;
    let helocYear = null;
    let condoSaleYear = null;
    let condoSaleProceeds = 0;
    let mortgageTotalPrincipalPaid = 0;

    projections.forEach(p => {
        if (p.liquid_assets_total < liquidMin) {
            liquidMin = p.liquid_assets_total;
            liquidMinYear = p.year;
        }
        if (p.total_ira_close < iraMin) {
            iraMin = p.total_ira_close;
            iraMinYear = p.year;
        }
        ltcTotal += (p.income.ltc_payout || 0);

        // Track HELOC usage
        if (p.heloc_balance && p.heloc_balance > maxHelocBalance) {
            maxHelocBalance = p.heloc_balance;
            helocYear = p.year;
        }

        // Track condo sale
        if (p.condo_sold && !condoSaleYear) {
            condoSaleYear = p.year;
            condoSaleProceeds = p.condo_sale_proceeds || 0;
        }

        // Track mortgage principal paid
        if (p.mortgage_principal_paid) {
            mortgageTotalPrincipalPaid += p.mortgage_principal_paid;
        }
        if (p.mortgage_paydown_from_sale) {
            mortgageTotalPrincipalPaid += p.mortgage_paydown_from_sale;
        }

        // Track real estate liquidation (critical failure case)
        if (p.real_estate_liquidation_needed && p.real_estate_liquidation_needed > 0) {
            if (realEstateLiquidationYear === null) {
                realEstateLiquidationYear = p.year;
            }
            realEstateLiquidationTotal += p.real_estate_liquidation_needed;
        }
    });

    // Get itemized breakdowns from first and last year
    const firstYear = projections[0];
    const lastYear = projections[projections.length - 1];

    return {
        liquid_assets_start: firstYear.liquid_assets_open,
        liquid_assets_min: liquidMin,
        liquid_assets_min_year: liquidMinYear,
        liquid_assets_final: lastYear.liquid_assets_total,
        ira_start: firstYear.total_ira_open,
        ira_min: iraMin,
        ira_min_year: iraMinYear,
        ira_final: lastYear.total_ira_close,
        ltc_total: ltcTotal,
        // Real estate liquidation tracking
        real_estate_liquidation_year: condoSaleYear || realEstateLiquidationYear,
        real_estate_liquidation_total: condoSaleProceeds || realEstateLiquidationTotal,
        heloc_max_balance: maxHelocBalance,
        heloc_year: helocYear,
        condo_sale_year: condoSaleYear,
        condo_sale_proceeds: condoSaleProceeds,
        // Mortgage tracking (dual mortgage system)
        mortgage_start: firstYear.mortgage_balance || 0,
        mortgage_final: lastYear.mortgage_balance_close || 0,
        primary_mortgage_final: lastYear.primary_mortgage_close || 0,
        condo_mortgage_final: lastYear.condo_mortgage_close || 0,
        mortgage_total_principal_paid: mortgageTotalPrincipalPaid,
        // Final real estate values
        house_value_final: lastYear.house_value || 0,
        condo_value_final: lastYear.condo_value || 0,
        real_estate_total_final: lastYear.real_estate_total || 0,
        // Trust balances (MAPT only)
        trust_balance_final: lastYear.trust_balance !== undefined ? lastYear.trust_balance : null,
        snt_balance_final: lastYear.snt_balance !== undefined ? lastYear.snt_balance : null,
        trust_exhausted_year: (function() {
            if (lastYear.trust_balance === undefined) return null;
            for (let i = 0; i < projections.length; i++) {
                const p = projections[i];
                if (p.trust_balance !== undefined && p.snt_balance !== undefined) {
                    if ((p.trust_balance || 0) + (p.snt_balance || 0) <= 0 && p.medicaid_active) {
                        return p.year;
                    }
                }
            }
            return null;
        })(),
        // Itemized breakdowns for tooltips
        income_breakdown: firstYear.income || {},
        liquid_assets_breakdown: {
            'SDIRA Checking': firstYear.sdira_checking_open,
            'ManagedIRA': firstYear.managed_ira_open,
            'LTC Savings': firstYear.ltc_savings_open
        }
    };
}

module.exports = { calculateMetrics };

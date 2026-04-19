/**
 * @file Initialize Scenario State
 * @summary Pre-loop setup: balances, mortgages, SNT, ledger, property sales
 * @description Extracted from _projectionEngine.js (Step 2 of refactor).
 *
 * Builds the initial ProjectionState object from scenario config and DB data.
 * Returns all mutable state that the year loop will modify.
 */

const { calculateMonthlyPIPayment } = require('./_calculateMortgagePayments');
const { calculateCondoSale } = require('./_calculateCondoSale');
const { PROJECTION_CONSTANTS } = require('./constants');

/**
 * Initialize all projection state from scenario configuration and DB data.
 *
 * @param {Object} scenario - Scenario row from DB
 * @param {Array} accounts - Activated account rows
 * @param {Array} properties - Activated property rows
 * @param {Object} rateSet - Rate set row
 * @returns {Object} Initial ProjectionState
 */
function initializeScenario(scenario, accounts, properties, rateSet) {
    const startYear = scenario.start_year || PROJECTION_CONSTANTS.baseYear;
    const endYear = scenario.year_of_passing || 2040;

    // IRA balances
    const sdiraAccount = accounts.find(a => a.id === 'SDIRA');
    const managedIraAccount = accounts.find(a => a.id === 'ManagedIRA');
    let sdiraCheckingBalance = scenario.sdira_start || sdiraAccount?.balance || 68000;
    let managedIraBalance = scenario.managed_ira_start || managedIraAccount?.balance || 300000;

    // LTC Savings (accumulated from payouts, starts at $0)
    let ltcSavingsBalance = 0;

    // Real estate
    const houseProp = properties.find(p => p.is_primary_residence);
    const condoProp = properties.find(p => !p.is_primary_residence);
    let houseValue = scenario.primary_house_value || houseProp?.current_value || 0;
    let condoValue = scenario.condo_value || condoProp?.current_value || 0;

    // HELOC
    let helocBalance = 0;
    const helocRate = scenario.heloc_rate || 0.075;
    const isMAPT = (scenario.condo_disposition === 'trust_mapt');
    const isGrantor = isMAPT && scenario.trust_type === 'grantor';
    const isNonGrantor = isMAPT && scenario.trust_type !== 'grantor';
    const helocMaxLtv = isMAPT ? 0 : 0.80;

    // Trust balances (MAPT only)
    let trustBalance = 0;
    let sntBalance = 0;
    const trustFormationYear = scenario.trust_formation_year || 2026;
    const lookbackClearYear = trustFormationYear + 5;

    // Medicaid tracking
    let medicaidActive = false;
    let medicaidTriggerYear = null;

    // Sibling equity ledger
    const ledger = {
        snt_condo_purchase: (scenario.total_mortgage_amount || 300000) - 30000,
        snt_initial_contribution: 0,
        snt_ira_liquidation: 0,
        cum_rental_to_condo_expenses: 0,
        cum_rental_to_primary_mortgage: 0,
        cum_rental_to_primary_house: 0,
        cum_roommate_to_primary: 0,
        cum_condo_mortgage_paid: 0,
        cum_condo_mortgage_interest: 0,
        cum_condo_mortgage_principal: 0,
        cum_snt_mapt_backup: 0
    };

    // Dual mortgage system
    let primaryMortgageBalance = 0;
    let primaryMortgageRate = 0;
    let condoMortgageBalance = 0;
    let condoMortgageRate = 0;
    let condoMortgageMonthlyPayment = 0;
    let mortgageBalance = 0;

    const sellUpfront = scenario.sell_condo_upfront === 1;

    if (scenario.condo_disposition === 'rental' || isMAPT) {
        const totalMortgage = scenario.total_mortgage_amount || 300000;
        const condoRate = scenario.condo_mortgage_rate || 0.065;

        // SNT seed funding
        const sntSeed = scenario.snt_seed || 10000;
        sntBalance += sntSeed;
        ledger.snt_initial_contribution = sntSeed;

        // mortgage_split_pct = down payment fraction (0.80 = 80% down, 20% mortgaged)
        const downPct = scenario.mortgage_split_pct || 0.80;
        const condoDownPayment = Math.round(totalMortgage * downPct);
        condoMortgageBalance = totalMortgage - condoDownPayment;
        condoMortgageRate = condoRate;
        condoMortgageMonthlyPayment = calculateMonthlyPIPayment(
            condoMortgageBalance, condoRate, 30
        );

        if (sellUpfront && isMAPT) {
            // Selling Arbor Roses upfront: no primary house refi needed.
            // Down payment + SNT seed come from condo sale proceeds (already in trustBalance).
            trustBalance -= condoDownPayment;
            trustBalance -= sntSeed;
            mortgageBalance = condoMortgageBalance;
        } else {
            // Standard dual mortgage: refi primary (IO) generates cash for
            // condo down payment + SNT seed + $20k closing/deferred maintenance.
            const primaryRate = scenario.primary_mortgage_rate || 0.057;
            const CLOSING_COSTS = 20000;
            primaryMortgageBalance = condoDownPayment + sntSeed + CLOSING_COSTS;
            primaryMortgageRate = primaryRate;
            mortgageBalance = primaryMortgageBalance + condoMortgageBalance;
        }
    }

    // Upfront condo sale
    let condoSold = sellUpfront;
    let condoSaleYear = condoSold ? startYear : null;
    let upfrontSaleProceeds = 0;

    if (sellUpfront && condoValue > 0) {
        const saleResult = calculateCondoSale({
            condoMarketValue: condoValue,
            costBasis: scenario.condo_original_basis || 400000,
            sellingCosts: condoValue * 0.05,
            ordinaryIncome: 0,
            isMarried: false
        });
        upfrontSaleProceeds = saleResult.netProceeds;
        if (isMAPT) {
            trustBalance += upfrontSaleProceeds;
        } else {
            ltcSavingsBalance += upfrontSaleProceeds;
        }
        condoValue = 0;
    }

    // Rental income flag
    const hasRentalIncome = !condoSold && (scenario.condo_disposition === 'rental' || isMAPT);

    return {
        // Balances
        sdiraCheckingBalance, managedIraBalance, ltcSavingsBalance,
        helocBalance, trustBalance, sntBalance,
        primaryMortgageBalance, condoMortgageBalance, condoMortgageMonthlyPayment,
        mortgageBalance, houseValue, condoValue,
        // Rates
        primaryMortgageRate, condoMortgageRate, helocRate, helocMaxLtv,
        // Flags
        condoSold, condoSaleYear, medicaidActive, medicaidTriggerYear,
        isMAPT, isGrantor, isNonGrantor, hasRentalIncome,
        // Derived config
        trustFormationYear, lookbackClearYear, sellUpfront, upfrontSaleProceeds,
        // Accumulator
        ledger,
        // Config
        scenario, accounts, rateSet,
        startYear, endYear,
        // Results
        years: []
    };
}

module.exports = { initializeScenario };

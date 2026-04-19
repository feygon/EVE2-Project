/**
 * Decide how to fund shortfall: LTC Savings vs IRA vs HELOC
 *
 * FINANCIAL CONCEPT:
 * - LTC Savings are post-tax (already paid taxes)
 * - IRA withdrawals are pre-tax (triggers income tax)
 * - HELOC is debt (not taxable, but must be repaid)
 *
 * CURRENT STRATEGY (Phase 2): Dumb 50/50 LTC/IRA split
 * FUTURE STRATEGY (Phase 3): Tax-aware optimization to minimize total tax burden
 *
 * SPENDING WATERFALL:
 * 1. If LTC Savings available: 50% from LTC, 50% from IRA
 * 2. If LTC depleted: 100% from IRA
 * 3. IRA priority: SDIRA Checking first (cash), then ManagedIRA (investments)
 * 4. If IRAs depleted: Use HELOC (debt against house)
 * 5. If HELOC maxed: Sell condo (triggers capital gains)
 * 6. If still short: Sell primary house (last resort)
 *
 * @param {number} shortfall - Amount needed after SS and rental income
 * @param {Object} balances - Current account balances
 * @param {number} balances.ltcSavings - LTC savings balance (post-tax)
 * @param {number} balances.sdiraChecking - SDIRA checking balance (cash)
 * @param {number} balances.managedIRA - Managed IRA balance (investments)
 * @param {number} balances.helocBalance - Current HELOC balance (debt)
 * @param {number} balances.helocMaxLtv - Maximum HELOC LTV ratio
 * @param {number} balances.houseValue - Primary house value
 * @param {number} balances.mortgageBalance - Combined mortgage balance (primary + SNT)
 * @param {number} balances.primaryMortgageBalance - Primary house mortgage balance (interest-only)
 * @param {number} balances.condoMortgageBalance - Condo mortgage balance (30yr P&I)
 * @param {number} balances.condoValue - Condo value (0 if already sold)
 * @param {boolean} balances.condoSold - Whether condo has been sold
 * @param {string} balances.condoDisposition - Condo disposition type
 * @param {number} year - Current projection year
 * @param {number} currentAGI - For tax bracket awareness (Phase 3)
 * @returns {Object} Withdrawal decision with amounts and explanations
 *
 * DECISION POINT: Should we use more LTC (post-tax) or IRA (pre-tax)?
 * TAX STRATEGY: Phase 3 will optimize to avoid IRMAA penalties and bracket jumps
 */

/**
 * Step 1: Split shortfall between LTC savings (post-tax) and IRA (pre-tax).
 * Default is 50/50 split; falls back to 100% IRA when LTC depleted.
 *
 * @param {number} shortfall - Total shortfall to fund
 * @param {Object} balances - Current account balances
 * @param {Object} optimizerHint - Optional optimizer override (Phase 3)
 * @returns {{ fromLTC: number, iraDistributions: number, newLtcBalance: number, strategy: string, explanation: string }}
 */
function splitLtcIra(shortfall, balances, optimizerHint) {
    const ltcAvailable = balances.ltcSavings;

    // Optimizer override: use DP-computed optimal split
    if (optimizerHint && optimizerHint.iraWithdrawal !== undefined) {
        const iraTarget = optimizerHint.iraWithdrawal;
        const totalIra = (balances.sdiraChecking || 0) + (balances.managedIRA || 0);
        // Clamp to what's actually available
        const fromIRA = Math.min(iraTarget, totalIra, shortfall);
        const fromLTC = Math.min(shortfall - fromIRA, ltcAvailable);
        const actualShortfall = fromIRA + fromLTC;
        // If optimizer split doesn't cover full shortfall, use remaining from IRA
        const gap = shortfall - actualShortfall;
        const extraIRA = gap > 0 ? Math.min(gap, totalIra - fromIRA) : 0;
        return {
            fromLTC,
            iraDistributions: fromIRA + extraIRA,
            newLtcBalance: ltcAvailable - fromLTC,
            strategy: 'optimizer — tax-minimized split',
            explanation: `Optimizer: $${Math.round(fromIRA + extraIRA).toLocaleString()} IRA, $${Math.round(fromLTC).toLocaleString()} LTC (saved $${Math.round(optimizerHint.taxSaved || 0).toLocaleString()} vs 50/50)`
        };
    }

    // FAMILY QUESTION: "Why do we use both LTC and IRA?"
    // ANSWER: 50/50 split preserves both pools, extends sustainability
    if (ltcAvailable > 0) {
        const fromLTC = Math.min(shortfall * 0.5, ltcAvailable);
        const iraDistributions = shortfall - fromLTC;
        return {
            fromLTC,
            iraDistributions,
            newLtcBalance: ltcAvailable - fromLTC,
            strategy: '50/50 LTC/IRA split',
            explanation: `Split shortfall evenly: $${Math.round(fromLTC).toLocaleString()} from LTC (post-tax), $${Math.round(iraDistributions).toLocaleString()} from IRA (pre-tax)`
        };
    }

    // LTC depleted, IRA covers 100%
    return {
        fromLTC: 0,
        iraDistributions: shortfall,
        newLtcBalance: 0,
        strategy: 'LTC depleted - 100% from IRA',
        explanation: 'LTC savings exhausted, all shortfall funded from IRA withdrawals'
    };
}

/**
 * Step 2: Withdraw from IRA accounts in priority order.
 * SDIRA Checking first (cash, no market risk), then ManagedIRA.
 *
 * @param {number} iraDistributions - Total IRA amount needed
 * @param {Object} result - Result object to mutate
 * @returns {number} Remaining shortfall if IRAs insufficient (0 if fully funded)
 */
function withdrawFromIRA(iraDistributions, result) {
    if (iraDistributions <= 0) return 0;

    const totalIraAvailable = result.newSdiraBalance + result.newManagedIraBalance;

    // FAMILY QUESTION: "Which IRA account gets used first?"
    // ANSWER: SDIRA Checking first (cash, no market risk), then ManagedIRA
    if (totalIraAvailable >= iraDistributions) {
        if (result.newSdiraBalance >= iraDistributions) {
            // SDIRA Checking covers it all
            result.fromSDIRA = iraDistributions;
        } else {
            // Drain SDIRA Checking, remainder from ManagedIRA
            result.fromSDIRA = result.newSdiraBalance;
            result.fromManagedIRA = iraDistributions - result.newSdiraBalance;
        }
        result.newSdiraBalance -= result.fromSDIRA;
        result.newManagedIraBalance -= result.fromManagedIRA;
        return 0;
    }

    // INSUFFICIENT LIQUID ASSETS - drain remaining IRA
    result.fromSDIRA = result.newSdiraBalance;
    result.fromManagedIRA = result.newManagedIraBalance;
    result.newSdiraBalance = 0;
    result.newManagedIraBalance = 0;

    return iraDistributions - totalIraAvailable;
}

/**
 * Step 3: Handle shortfall when IRAs are insufficient.
 * Uses HELOC draw, condo sale (when debt > 60% LTV), or flags for property sale.
 *
 * @param {number} liquidAssetShortfall - Remaining shortfall after IRA depletion
 * @param {Object} result - Result object to mutate
 * @param {Object} balances - Current account balances
 * @param {number} year - Current projection year
 */
function handleInsufficientIRA(liquidAssetShortfall, result, balances, year) {
    const { helocMaxLtv, houseValue, condoValue, condoSold, condoDisposition } = balances;

    const totalDebtOnHouse = result.newHelocBalance + result.newMortgageBalance;
    const debtThreshold = houseValue * 0.60;
    const condoAvailableToSell = !condoSold &&
        (condoDisposition === 'rental' || condoDisposition === 'trust_mapt');

    if (condoAvailableToSell && totalDebtOnHouse > debtThreshold) {
        sellCondoAndAllocate(result, balances, houseValue, condoValue, totalDebtOnHouse);
        retryDistributionAfterCondoSale(liquidAssetShortfall, result, houseValue, helocMaxLtv, year);
    } else {
        // FAMILY QUESTION: "When do we start borrowing against the house?"
        // ANSWER: When IRA accounts are depleted, before selling property
        drawFromHELOC(liquidAssetShortfall, result, houseValue, helocMaxLtv, year);
    }
}

/**
 * Sell condo and allocate proceeds: HELOC payoff -> mortgage -> SDIRA.
 */
function sellCondoAndAllocate(result, balances, houseValue, condoValue, totalDebtOnHouse) {
    result.condoSoldThisYear = true;
    result.condoProceeds = condoValue * 0.95;  // 5% haircut for selling costs
    let remainingProceeds = result.condoProceeds;

    // Priority 1: Pay off HELOC (highest interest rate 7.25%)
    if (result.newHelocBalance > 0) {
        result.helocPayoff = Math.min(result.newHelocBalance, remainingProceeds);
        result.newHelocBalance -= result.helocPayoff;
        remainingProceeds -= result.helocPayoff;
    }

    // Priority 2: Pay down primary mortgage (interest-only, paying off frees up cash)
    if (result.newPrimaryMortgageBalance > 0 && remainingProceeds > 0) {
        result.primaryMortgagePaydown = Math.min(result.newPrimaryMortgageBalance, remainingProceeds);
        result.newPrimaryMortgageBalance -= result.primaryMortgagePaydown;
        remainingProceeds -= result.primaryMortgagePaydown;
    }

    // Priority 3: Pay down SNT mortgage
    if (result.newCondoMortgageBalance > 0 && remainingProceeds > 0) {
        result.condoMortgagePaydown = Math.min(result.newCondoMortgageBalance, remainingProceeds);
        result.newCondoMortgageBalance -= result.condoMortgagePaydown;
        remainingProceeds -= result.condoMortgagePaydown;
    }

    result.mortgagePaydown = result.primaryMortgagePaydown + result.condoMortgagePaydown;
    result.newMortgageBalance = result.newPrimaryMortgageBalance + result.newCondoMortgageBalance;

    // Priority 4: Remainder to SDIRA Checking
    result.sdiraFromCondoSale = remainingProceeds;
    result.newSdiraBalance += remainingProceeds;
    result.newCondoValue = 0;

    // Build detailed sale note
    let saleNote = `Condo sold for $${Math.round(result.condoProceeds).toLocaleString()}.`;
    if (result.helocPayoff > 0) {
        saleNote += ` HELOC paid off: $${Math.round(result.helocPayoff).toLocaleString()}.`;
    }
    if (result.mortgagePaydown > 0) {
        saleNote += ` Mortgage paid down: $${Math.round(result.mortgagePaydown).toLocaleString()}.`;
    }
    if (remainingProceeds > 0) {
        saleNote += ` Remainder to SDIRA: $${Math.round(remainingProceeds).toLocaleString()}.`;
    }
    result.note = saleNote;

    result.strategy = 'IRA depleted - condo sold';
    result.explanation = `Debt threshold exceeded (${Math.round(totalDebtOnHouse / houseValue * 100)}% LTV). Condo liquidated to pay down debt.`;
}

/**
 * After condo sale, retry IRA distribution from newly available SDIRA funds.
 * Falls back to HELOC if proceeds still insufficient.
 */
function retryDistributionAfterCondoSale(liquidAssetShortfall, result, houseValue, helocMaxLtv, year) {
    if (result.newSdiraBalance >= liquidAssetShortfall) {
        result.fromSDIRA += liquidAssetShortfall;
        result.newSdiraBalance -= liquidAssetShortfall;
    } else {
        // Still need more - use remaining SDIRA and continue to HELOC
        result.fromSDIRA += result.newSdiraBalance;
        const remainingShortfall = liquidAssetShortfall - result.newSdiraBalance;
        result.newSdiraBalance = 0;

        // Now use HELOC for remaining amount
        const helocCapacity = (houseValue * helocMaxLtv) - result.newHelocBalance - result.newMortgageBalance;
        if (helocCapacity >= remainingShortfall) {
            result.newHelocBalance += remainingShortfall;
            result.newSdiraBalance += remainingShortfall;
            result.fromSDIRA += remainingShortfall;
            result.newSdiraBalance -= remainingShortfall;
            result.fromHELOC = remainingShortfall;
        } else {
            // HELOC maxed out - need to sell primary house
            result.warning = `CRITICAL: All liquid assets and HELOC capacity exhausted in ${year}. Primary house sale required.`;
            result.realEstateLiquidationNeeded = remainingShortfall - helocCapacity;
        }
    }
}

/**
 * Draw from HELOC when IRA depleted but condo sale threshold not reached.
 * Falls back to property sale flag when HELOC capacity insufficient.
 */
function drawFromHELOC(liquidAssetShortfall, result, houseValue, helocMaxLtv, year) {
    const helocCapacity = (houseValue * helocMaxLtv) - result.newHelocBalance - result.newMortgageBalance;

    if (helocCapacity >= liquidAssetShortfall) {
        // HELOC has enough capacity
        result.newHelocBalance += liquidAssetShortfall;
        result.newSdiraBalance += liquidAssetShortfall;
        result.fromSDIRA += liquidAssetShortfall;
        result.newSdiraBalance -= liquidAssetShortfall;
        result.fromHELOC = liquidAssetShortfall;
        result.note = `Drew $${Math.round(liquidAssetShortfall).toLocaleString()} from HELOC. Balance: $${Math.round(result.newHelocBalance).toLocaleString()}`;
        result.strategy = 'IRA depleted - using HELOC';
        result.explanation = `IRAs exhausted. Drawing from HELOC (debt, not taxable income).`;
    } else {
        // HELOC doesn't have enough capacity
        if (helocCapacity > 0) {
            result.newHelocBalance += helocCapacity;
            result.newSdiraBalance += helocCapacity;
            result.fromSDIRA += helocCapacity;
            result.newSdiraBalance -= helocCapacity;
            result.fromHELOC = helocCapacity;
        }
        const stillShort = liquidAssetShortfall - helocCapacity;
        result.realEstateLiquidationNeeded = stillShort;
        result.warning = `CRITICAL: HELOC maxed out in ${year}. Need to sell property for $${Math.round(stillShort).toLocaleString()}.`;
        result.strategy = 'HELOC maxed - property sale needed';
        result.explanation = `All liquid assets and HELOC exhausted. Property liquidation required.`;
    }
}

/**
 * Decides how to fund a shortfall using the spending waterfall (LTC -> IRA -> HELOC -> property sale).
 *
 * @param {number} shortfall - Amount needed after SS and rental income
 * @param {Object} balances - Current account balances (ltcSavings, sdiraChecking, managedIRA, helocBalance, etc.)
 * @param {number} year - Current projection year
 * @param {number} currentAGI - Current adjusted gross income for tax bracket awareness
 * @param {Object} [optimizerHint] - Optional DP optimizer override with iraWithdrawal and taxSaved
 * @returns {Object} Withdrawal decision with amounts, updated balances, strategy description, and warnings
 */
function _decideWithdrawalStrategy(shortfall, balances, year, currentAGI, optimizerHint) {
    const {
        ltcSavings,
        sdiraChecking,
        managedIRA,
        helocBalance,
        helocMaxLtv,
        houseValue,
        mortgageBalance,
        primaryMortgageBalance = 0,
        condoMortgageBalance = 0,
        condoValue,
        condoSold,
        condoDisposition
    } = balances;

    // Initialize result object
    const result = {
        fromLTC: 0, fromSDIRA: 0, fromManagedIRA: 0, fromHELOC: 0,
        newLtcBalance: ltcSavings,
        newSdiraBalance: sdiraChecking,
        newManagedIraBalance: managedIRA,
        newHelocBalance: helocBalance,
        newMortgageBalance: mortgageBalance,
        newPrimaryMortgageBalance: primaryMortgageBalance,
        newCondoMortgageBalance: condoMortgageBalance,
        newCondoValue: condoValue,
        condoSoldThisYear: false,
        condoProceeds: 0,
        helocPayoff: 0,
        mortgagePaydown: 0,
        primaryMortgagePaydown: 0,
        condoMortgagePaydown: 0,
        sdiraFromCondoSale: 0,
        strategy: '', explanation: '', note: '', warning: '',
        realEstateLiquidationNeeded: 0
    };

    if (shortfall <= 0) {
        result.strategy = 'no shortfall';
        result.explanation = 'External income (SS + rental) covers all expenses';
        return result;
    }

    // Step 1: LTC/IRA split
    const split = splitLtcIra(shortfall, balances, optimizerHint);
    result.fromLTC = split.fromLTC;
    result.newLtcBalance = split.newLtcBalance;
    result.strategy = split.strategy;
    result.explanation = split.explanation;

    // Step 2: Withdraw from IRA accounts (SDIRA first, then ManagedIRA)
    const liquidAssetShortfall = withdrawFromIRA(split.iraDistributions, result);

    // Step 3: Handle insufficient IRA (HELOC draw / condo sale / critical warning)
    if (liquidAssetShortfall > 0) {
        handleInsufficientIRA(liquidAssetShortfall, result, balances, year);
    }

    return result;
}

module.exports = { _decideWithdrawalStrategy };

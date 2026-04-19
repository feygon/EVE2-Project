/**
 * @file Two-Pass Tax Calculation
 * @summary Extracted from _projectionEngine.js (Step 8a of refactor).
 *
 * Pass 1 (taxEstimate): Estimates taxes from GROSS_EXPENSE_TARGET before
 *   withdrawal strategy runs. Used to size lifestyle and shortfall.
 *
 * Pass 2 (taxActual): Recalculates taxes after actual IRA distributions
 *   are known, including IRMAA surcharge and effective tax rate.
 */

const _calculateSSDITaxability = require('./_calculateSSDITaxability');
const _calculateEffectiveTaxRate = require('./_calculateEffectiveTaxRate');
const { TAX_CONSTANTS } = require('./constants');

/**
 * Tax Pass 1 — Estimate taxes from gross expense target.
 *
 * @param {Object} params
 * @param {number} params.ssdAmount - Annual SSDI/SS income
 * @param {number} params.GROSS_EXPENSE_TARGET - Pre-facility personal budget
 * @param {boolean} params.isMAPT - Whether MAPT trust is active
 * @param {Object} params.yearData - Mutable year record
 * @param {Object} params.ltcPolicy - LTC policy object (or null)
 * @param {Object} params.scenario - Scenario config
 * @param {number} params.year - Calendar year
 * @param {number} params.memoryCareAmount - Memory care cost for year
 * @param {boolean} params.inMemoryCare - Whether in memory care this year
 * @param {number} params.condoValue - Current condo value
 * @param {boolean} params.hasRentalIncome - Whether rental income exists
 * @param {Object} params.callbacks - { _calculateItemizedDeductions, _calculateFederalTax, _calculateOregonTax }
 * @returns {Object} Tax estimate results
 */
function taxEstimate(params) {
    const {
        ssdAmount, GROSS_EXPENSE_TARGET, isMAPT, isNonGrantor: isNonGrantorParam, yearData,
        ltcPolicy, scenario, year, memoryCareAmount,
        inMemoryCare, condoValue, hasRentalIncome, callbacks
    } = params;

    // Default: if isNonGrantor not explicitly passed, fall back to isMAPT (backward compat)
    // Per directive 2026-04-06: MAPT is always non-grantor with LPOA.
    // The toggle parameter is accepted for backward compat but ignored —
    // isNonGrantor always equals isMAPT. See decision-log D-011.
    const isNonGrantor = isMAPT;

    // Estimate IRA distributions from gross expense target
    const estimatedIraDistributions = Math.max(0, GROSS_EXPENSE_TARGET - ssdAmount);

    // Calculate SSDI taxability tier based on provisional income
    // Non-grantor MAPT: rental income belongs to trust (1041), not Person A — exclude from AGI
    // Grantor MAPT: rental is Person A's income (1040) — include in AGI
    // LEDGER-REFACTOR: SNT condo mortgage interest is dead money — not
    // deductible to Person A, MAPT, or SNT (see docs/ledger-refactor/rationale-digest.md §H)
    const rentalForTax = isNonGrantor ? 0 : (yearData.income.rental || 0);
    const estimatedOtherIncome = rentalForTax + estimatedIraDistributions;
    const ssdiResult = _calculateSSDITaxability(ssdAmount, estimatedOtherIncome, 0);

    // Rental income is NOT subtracted from GROSS_TARGET because it's earmarked for condo
    // A's budget ($95k) + Rental ($28k earmarked) = total allowed spending
    // MAPT: rental excluded — it flows through the trust
    const estimatedAGI = ssdiResult.taxableSS + rentalForTax + estimatedIraDistributions;

    // Calculate itemized deductions before tax
    const ltcTriggered = ltcPolicy && scenario.ltc_trigger_year && year >= scenario.ltc_trigger_year;
    const deductionInfo = callbacks._calculateItemizedDeductions(
        estimatedAGI,
        yearData.expenses,
        memoryCareAmount,
        ltcTriggered,
        inMemoryCare,
        scenario,
        condoValue,
        hasRentalIncome,
        year,
        isNonGrantor  // Grantor: Person A gets deductions on 1040. Non-grantor: trust gets them on 1041.
    );
    yearData.deduction_amount = deductionInfo.amount;
    yearData.deduction_type = deductionInfo.type;
    yearData.itemized_breakdown = deductionInfo.itemized_breakdown;
    yearData.medical_expenses = deductionInfo.medical_expenses;
    yearData.nursing_tier = deductionInfo.nursing_tier || null;

    // Calculate federal tax using deduction
    const federalTax = callbacks._calculateFederalTax(estimatedAGI, year, deductionInfo.amount);
    yearData.expenses.federal_income_tax = federalTax;

    // Calculate Oregon state income tax
    const oregonResult = callbacks._calculateOregonTax(estimatedAGI, year, deductionInfo);
    const oregonTax = oregonResult.tax;
    yearData.expenses.oregon_income_tax = oregonTax;
    yearData.oregon_deduction_amount = oregonResult.oregonDeduction;
    yearData.oregon_deduction_type = oregonResult.oregonDeductionType;

    // Total tax (federal + state)
    const totalTax = federalTax + oregonTax;

    return {
        estimatedAGI,
        federalTax,
        oregonTax,
        totalTax,
        deductionInfo,
        rentalForTax,
        ltcTriggered
    };
}

/**
 * Tax Pass 2 — Recalculate taxes with actual IRA distributions.
 *
 * @param {Object} params
 * @param {number} params.ssdAmount - Annual SSDI/SS income
 * @param {number} params.iraDistributions - Actual IRA distributions taken
 * @param {number} params.rentalForTax - Rental income for tax purposes (0 if MAPT)
 * @param {boolean} params.isMAPT - Whether MAPT trust is active
 * @param {Object} params.yearData - Mutable year record
 * @param {boolean} params.ltcTriggered - Whether LTC policy is triggered
 * @param {Object} params.scenario - Scenario config
 * @param {number} params.year - Calendar year
 * @param {number} params.memoryCareAmount - Memory care cost for year
 * @param {boolean} params.inMemoryCare - Whether in memory care this year
 * @param {number} params.condoValue - Current condo value
 * @param {boolean} params.hasRentalIncome - Whether rental income exists
 * @param {number} params.fixedExpenses - Fixed expenses for the year
 * @param {number} params.lifestyleExpense - Lifestyle expense (Bug #1: must be included)
 * @param {Array} params.years - All projection years (for IRMAA lookback)
 * @param {Object} params.callbacks - { _calculateItemizedDeductions, _calculateFederalTax, _calculateOregonTax }
 * @returns {Object} Actual tax results
 */
function taxActual(params) {
    const {
        ssdAmount, iraDistributions, rentalForTax, isMAPT, isNonGrantor: isNonGrantorActual, yearData,
        ltcTriggered, scenario, year, memoryCareAmount,
        inMemoryCare, condoValue, hasRentalIncome,
        fixedExpenses, lifestyleExpense, years, callbacks
    } = params;

    // Per directive 2026-04-06: MAPT is always non-grantor with LPOA.
    const isNonGrantor = isMAPT;

    // IMPORTANT: Only count ACTUAL IRA withdrawals, not HELOC proceeds (which aren't taxable)
    const helocDrawn = yearData.heloc_drawn || 0;
    const actualTaxableIraDistributions = iraDistributions - helocDrawn;

    // Calculate SSDI taxability based on actual income
    // MAPT: rental belongs to trust, exclude from Person A's AGI
    const actualOtherIncome = rentalForTax + actualTaxableIraDistributions;
    const actualSsdiResult = _calculateSSDITaxability(ssdAmount, actualOtherIncome, 0);

    // AGI = adjusted amount that actually gets taxed (taxable SS, rental, IRA-HELOC)
    const actualAGI = actualSsdiResult.taxableSS + rentalForTax + actualTaxableIraDistributions;

    // Recalculate itemized deductions with actual AGI
    const actualDeductionInfo = callbacks._calculateItemizedDeductions(
        actualAGI,
        yearData.expenses,
        memoryCareAmount,
        ltcTriggered,
        inMemoryCare,
        scenario,
        condoValue,
        hasRentalIncome,
        year,
        isNonGrantor
    );
    yearData.deduction_amount = actualDeductionInfo.amount;
    yearData.deduction_type = actualDeductionInfo.type;
    yearData.itemized_breakdown = actualDeductionInfo.itemized_breakdown;
    yearData.medical_expenses = actualDeductionInfo.medical_expenses;
    yearData.nursing_tier = actualDeductionInfo.nursing_tier || null;

    // IRS-definition taxable income: AGI minus (itemized or standard) deduction.
    // This is the correct bracket-lookup basis for marginal rate computations.
    // Replaces the misleading `taxable_income_total` field (deleted 2026-04-06)
    // which was actually gross income components, not taxable income.
    // See: decision-log D-012
    yearData.taxable_income_after_deductions = Math.max(0, actualAGI - actualDeductionInfo.amount);

    const federalTax = callbacks._calculateFederalTax(actualAGI, year, actualDeductionInfo.amount);
    yearData.expenses.federal_income_tax = federalTax;

    const actualOregonResult = callbacks._calculateOregonTax(actualAGI, year, actualDeductionInfo);
    const oregonTax = actualOregonResult.tax;
    yearData.expenses.oregon_income_tax = oregonTax;
    yearData.oregon_deduction_amount = actualOregonResult.oregonDeduction;
    yearData.oregon_deduction_type = actualOregonResult.oregonDeductionType;

    yearData.agi = actualAGI;

    // MAGI = AGI + tax-exempt interest + foreign income
    // For Person A: no municipal bonds or foreign income, so MAGI = AGI
    yearData.magi = actualAGI;

    // IRMAA surcharge: uses MAGI from 2 years prior (Medicare lookback)
    // Person A is 70+ so Medicare-eligible for all projection years
    const irmaaTiers = TAX_CONSTANTS.federal.irmaaTiers2026;
    let irmaaLookbackMagi = 0;
    const lookbackIndex = years.length - 2;  // 2 years prior in the years array
    if (lookbackIndex >= 0) {
        irmaaLookbackMagi = years[lookbackIndex].magi || 0;
    } else {
        // First 2 years: use current MAGI as approximation
        irmaaLookbackMagi = actualAGI;
    }
    let irmaaSurcharge = 0;
    for (let t = irmaaTiers.length - 1; t >= 0; t--) {
        if (irmaaLookbackMagi >= irmaaTiers[t].threshold) {
            irmaaSurcharge = Math.round((irmaaTiers[t].partB + irmaaTiers[t].partD) * 12);
            break;
        }
    }
    yearData.irmaa_surcharge = irmaaSurcharge;
    yearData.irmaa_lookback_magi = irmaaLookbackMagi;
    // Post-Medicaid: IRMAA is deducted from SS before patient pay — self-funding, not a family cost
    const irmaaSelfFunding = yearData.medicaid_active || yearData.ss_seized;
    yearData.irmaa_self_funding = irmaaSelfFunding ? true : false;
    yearData.expenses.irmaa = irmaaSelfFunding ? 0 : irmaaSurcharge;
    yearData.expenses.irmaa_gross = irmaaSurcharge; // Always track the gross amount for display

    // Add medical expenses to expense breakdown
    // These are actual cash outflows (in-home care, doctor visits, etc.)
    // NOT the same as deductible medical (which is reduced by 7.5% AGI floor)
    const actualMedicalExpenses = actualDeductionInfo.medical_expenses;
    if (actualMedicalExpenses > 0 && !inMemoryCare) {
        yearData.expenses.medical = actualMedicalExpenses;
    }

    // Update total expenses with actual tax + medical + IRMAA + lifestyle (Bug #1 fix)
    const actualTotalTax = federalTax + oregonTax;
    const medicalOutflow = inMemoryCare ? 0 : actualMedicalExpenses;
    const charitableExpense = yearData.expenses.charitable || 0;
    const totalExpenses = fixedExpenses + actualTotalTax + lifestyleExpense + charitableExpense + medicalOutflow + irmaaSurcharge;

    yearData.expenses.total = totalExpenses;

    // Calculate effective tax rate (actual rate paid vs marginal bracket rate)
    const effectiveRateResult = _calculateEffectiveTaxRate(actualTotalTax, actualAGI);
    yearData.effectiveTaxRate = effectiveRateResult.effectiveTaxRate;

    return {
        actualAGI,
        federalTax,
        oregonTax,
        irmaaSurcharge,
        totalExpenses,
        taxable_ss: actualSsdiResult.taxableSS,
        ss_tier: actualSsdiResult.tier,
        provisional_income: actualSsdiResult.provisionalIncome,
        ss_taxable_fraction: actualSsdiResult.taxableFraction,
        actualTotalTax,
        medicalOutflow,
        actualDeductionInfo
    };
}

module.exports = { taxEstimate, taxActual };

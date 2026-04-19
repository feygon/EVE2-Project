/**
 * @file _validateQ1Q2Funding.js
 * @description Post-DP validation for sub-annual cash flow.
 *   Checks whether Q1/Q2 (Jan-Jun) expenses can be funded before LS6 matures in June.
 *   Also validates full-year solvency for the Medicaid activation year.
 *
 *   This is a deterministic check run AFTER the optimizer produces its annual policy.
 *   It does NOT modify the DP decisions — it flags warnings for the family.
 *
 * @DECISION H1/H2 split is 50/50 by month (6/12 each half).
 * @DECISION LS6 matures June 2036. Before that date, LS6 funds are NOT available for H1.
 */

const LS6_MATURITY_YEAR = 2036;
const LS6_AMOUNT = 65000;

/**
 * @typedef {Object} Q1Q2ValidationResult
 * @property {boolean} mc_private_pay_runway_ok  - Can we fund 3 full years of private-pay MC?
 * @property {boolean} mc_q1q2_funded            - Is the final MC year's H1 covered pre-LS6?
 * @property {number|null} mc_early_medicaid_flag - Year to apply for Medicaid bed if runway fails
 * @property {boolean} mc_affordable_facility_warning - True if flagged at MC-1 year
 * @property {Array} yearFlags                   - Per-year H1 solvency flags
 */

/**
 * Validate Q1/Q2 funding across the projection.
 *
 * @param {Object} optimizerResult - Output from optimizeWithdrawalDP
 * @param {Object} scenario - Scenario DB row
 * @param {number} startIra - Starting IRA balance
 * @param {number} startLtc - Starting LTC balance
 * @param {number} iraGrowth - Annual IRA growth rate
 * @returns {Q1Q2ValidationResult}
 */
function validateQ1Q2Funding(optimizerResult, scenario, startIra, startLtc, iraGrowth) {
    const memoryCareYear = scenario.memory_care_year || 2032;
    const medicaidYear = memoryCareYear + 3; // 3-year private pay cap
    const decisions = optimizerResult.decisions;

    let iraBal = startIra;
    let ltcBal = startLtc;
    const yearFlags = [];
    let runwayOk = true;
    let q1q2Funded = true;
    let earlyMedicaidFlag = null;
    let affordableWarning = false;

    const years = Object.keys(decisions).map(Number).sort((a, b) => a - b);

    for (const year of years) {
        const d = decisions[year];
        const inMC = year >= memoryCareYear;
        const isMedicaidYear = year >= medicaidYear;

        // H1 expenses = half of annual shortfall (50/50 by month)
        const h1Expenses = (d.iraWithdrawal + d.ltcWithdrawal) / 2;

        // H1 available sources: IRA + LTC + H1 lump sums (LS7 is Jan, available H1)
        // LS6 matures June — NOT available for H1 in maturity year, available H2 only
        const h1Sources = iraBal + ltcBal;

        const h1Ok = h1Sources >= h1Expenses || h1Expenses <= 0;

        // Full-year solvency
        const totalNeeded = d.iraWithdrawal + d.ltcWithdrawal;
        const totalAvailable = iraBal + ltcBal + (year >= LS6_MATURITY_YEAR ? LS6_AMOUNT : 0);
        const fullYearOk = totalAvailable >= totalNeeded || totalNeeded <= 0;

        yearFlags.push({
            year,
            h1Ok,
            fullYearOk,
            h1Expenses: Math.round(h1Expenses),
            h1Sources: Math.round(h1Sources),
            totalNeeded: Math.round(totalNeeded),
            totalAvailable: Math.round(totalAvailable)
        });

        // Check Medicaid activation year specifically
        if (inMC && year === medicaidYear - 1) {
            // Year before Medicaid: check if next year is fundable
            const nextIra = (iraBal - d.iraWithdrawal) * (1 + iraGrowth);
            const nextLtc = ltcBal - d.ltcWithdrawal;
            const nextYearDecision = decisions[year + 1];
            if (nextYearDecision) {
                const nextH1 = (nextYearDecision.iraWithdrawal + nextYearDecision.ltcWithdrawal) / 2;
                const nextH1Sources = nextIra + nextLtc;
                if (nextH1Sources < nextH1) {
                    q1q2Funded = false;
                    earlyMedicaidFlag = year; // Apply for Medicaid bed THIS year
                }
                const nextTotal = nextYearDecision.iraWithdrawal + nextYearDecision.ltcWithdrawal;
                const nextTotalAvail = nextIra + nextLtc + (year + 1 >= LS6_MATURITY_YEAR ? LS6_AMOUNT : 0);
                if (nextTotalAvail < nextTotal) {
                    runwayOk = false;
                    earlyMedicaidFlag = year;
                }
            }
        }

        // Transition balances
        iraBal = (iraBal - d.iraWithdrawal) * (1 + iraGrowth);
        ltcBal = ltcBal - d.ltcWithdrawal;
    }

    // Advance notice: flag at MC-1 if runway fails
    if (!runwayOk || !q1q2Funded) {
        affordableWarning = true;
        if (!earlyMedicaidFlag) {
            earlyMedicaidFlag = memoryCareYear - 1;
        }
    }

    return {
        mc_private_pay_runway_ok: runwayOk,
        mc_q1q2_funded: q1q2Funded,
        mc_early_medicaid_flag: earlyMedicaidFlag,
        mc_affordable_facility_warning: affordableWarning,
        yearFlags
    };
}

module.exports = { validateQ1Q2Funding, LS6_MATURITY_YEAR, LS6_AMOUNT };

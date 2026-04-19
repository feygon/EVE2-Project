/**
 * @file Financial Planning Constants
 * @description All values documented with WHY and DECISION implications
 * @date 2026-02-21
 * @author Programmer P4 (CV-4 Refactoring)
 *
 * PURPOSE:
 * Centralizes magic numbers into named constants with financial context.
 * Each constant includes:
 *   - WHY: Financial reason for this value
 *   - DECISION: How it affects family financial choices
 *   - LIMITATION: Known simplifications (Phase 3 improvements)
 */

const TAX_CONSTANTS = {
    federal: {
        /**
         * Standard deduction for single filer age 65+ (2025/2026)
         * WHY: Standard deduction reduces taxable income before tax calculation
         * DECISION: Compare to itemized to choose lower tax option
         */
        standardDeduction2026: 21750,

        /**
         * IRMAA penalty threshold for Medicare Part B (deprecated - use irmaaTiers2026 instead)
         * WHY: AGI above this adds $1,052/yr Medicare premium
         * DECISION: Phase 3 will try to stay below this threshold
         * NOTE: 2024 threshold is $103,000; using $106,000 for 2026 estimate
         * @deprecated Use irmaaTiers2026 for accurate tier-based penalties
         */
        irmaaPenaltyThreshold: 106000,

        /**
         * IRMAA penalty tiers (2026 projected values)
         * WHY: Medicare Part B and Part D premiums increase based on MAGI (cliff structure)
         * DECISION: Each tier represents a cliff - $1 over threshold triggers full annual penalty
         * TAX STRATEGY: Phase E will add guardrails to prevent crossing tier thresholds
         *
         * STRUCTURE:
         * - threshold: MAGI floor for this tier (single filer)
         * - partB: MONTHLY Part B surcharge (base premium ~$185/mo NOT included)
         * - partD: MONTHLY Part D surcharge (base premium varies by plan, NOT included)
         *
         * ANNUAL PENALTY = (partB + partD) × 12
         *
         * Example: MAGI of $109,001 triggers Tier 1:
         *   Monthly: $81.20 (Part B) + $14.50 (Part D) = $95.70
         *   Annual: $95.70 × 12 = $1,148.40
         *
         * SOURCE: Owner-Corrections-Session-2.md (2026 projected values)
         */
        irmaaTiers2026: [
            { threshold: 0, partB: 0, partD: 0 },                    // $109k or less - no penalty
            { threshold: 109001, partB: 81.20, partD: 14.50 },      // $109k-$137k
            { threshold: 137001, partB: 202.90, partD: 37.50 },     // $137k-$171k
            { threshold: 171001, partB: 324.60, partD: 60.40 },     // $171k-$205k
            { threshold: 205001, partB: 446.30, partD: 83.30 },     // $205k-$500k
            { threshold: 500001, partB: 487.00, partD: 91.00 }      // $500k+ (max tier)
        ],

        /**
         * SALT (State and Local Tax) deduction cap
         * WHY: 2017 Tax Cuts capped state/local tax deduction at $10k
         * DECISION: Property taxes above $10k don't provide additional deduction
         */
        saltCap: 10000,

        /**
         * Long-term capital gains rate (single filer, >$44,626 income)
         * WHY: Condo sale in non-MAPT scenarios triggers LTCG on appreciation
         * DECISION: Person A's income typically exceeds the 0% threshold
         * NOTE: MAPT scenarios get stepped-up basis via LPOA — no capital gains
         */
        ltcgRate: 0.15,

        /**
         * Net Investment Income Tax (NIIT) rate
         * WHY: 3.8% surtax on investment income when MAGI > $200k (single)
         * DECISION: Condo sale gain likely pushes MAGI above threshold
         */
        niitRate: 0.038,
        niitThreshold: 200000,

        /**
         * 2025 Federal Tax Brackets (Single Filer)
         * WHY: Progressive tax system applies different rates to income tiers
         * DECISION: IRA withdrawal amounts can push income into higher brackets
         */
        brackets: [
            { limit: 11925, rate: 0.10, base: 0 },
            { limit: 48475, rate: 0.12, base: 1192.50 },
            { limit: 103350, rate: 0.22, base: 5578.50 },
            { limit: Infinity, rate: 0.24, base: 17651 }
        ]
    },

    oregon: {
        /**
         * Oregon standard deduction (single filer)
         * WHY: Oregon state standard deduction (much lower than federal)
         * DECISION: Oregon can itemize even if federal uses standard
         * STRATEGY: Often beneficial to use standard federal + itemized Oregon
         */
        standardDeduction: 2605,

        /**
         * 2025 Oregon Tax Brackets (Single Filer)
         * WHY: Oregon has its own progressive tax structure
         * DECISION: State taxes affect total tax burden
         */
        brackets: [
            { limit: 4300, rate: 0.0475, base: 0 },
            { limit: 10750, rate: 0.0675, base: 204.25 },
            { limit: 125000, rate: 0.0875, base: 639.63 },
            { limit: Infinity, rate: 0.099, base: 10637.50 }
        ]
    },

    /**
     * 2026 Federal Trust/Estate Tax Brackets (Form 1041)
     * WHY: Non-grantor trusts use compressed brackets that hit top rate at ~$16k
     * DECISION: For our non-grantor MAPT, trust taxable income is ~$0 after
     * Schedule E deductions, so the compressed brackets are largely irrelevant.
     * Trust exemption is $100 (complex trust) — no standard deduction.
     */
    trustFederal: {
        exemption: 100,
        brackets: [
            { limit: 3300, rate: 0.10, base: 0 },
            { limit: 11700, rate: 0.24, base: 330 },
            { limit: 16000, rate: 0.35, base: 2346 },
            { limit: Infinity, rate: 0.37, base: 3851 }
        ]
    },

    /**
     * 2026 Oregon Trust/Estate Tax Brackets (Form OR-41)
     * WHY: Oregon taxes trust income at individual-like rates but no standard deduction
     * DECISION: Oregon allows subtraction of portion of federal tax paid
     */
    trustOregon: {
        exemption: 0,
        brackets: [
            { limit: 4400, rate: 0.0475, base: 0 },
            { limit: 11050, rate: 0.0675, base: 209 },
            { limit: 125000, rate: 0.0875, base: 657.88 },
            { limit: Infinity, rate: 0.099, base: 10623.63 }
        ]
    },

    medical: {
        /**
         * AGI floor for medical expense deduction
         * WHY: Medical expenses only deductible above this % of AGI
         * DECISION: Higher AGI = higher floor = less deductible
         */
        agiFloorPercent: 0.075
    },

    socialSecurity: {
        /**
         * Social Security taxability tiers (IRS Publication 915)
         * Filing status: Single (Person A is a widow)
         *
         * Provisional income = other income + (SS benefits × 0.5) + tax-exempt interest
         *
         * 2025 thresholds (single filer):
         *   Below $25,000: 0% of benefits taxed
         *   $25,000-$34,000: up to 50% of benefits taxed
         *   Above $34,000: up to 85% of benefits taxed
         *
         * WHY: SS benefits are partially taxable based on total income
         * DECISION: IRA withdrawals increase provisional income, potentially taxing more SS
         */
        taxableRate: 0.85,  // Maximum taxable fraction at highest tier
        /**
         * IRS Publication 915 provisional income thresholds (single filer)
         *
         * The IRS avoids a circular dependency by using "provisional income"
         * (which excludes taxable SS) to determine how much SS is taxable.
         * Result is a fixed dollar amount — no loop needed.
         *
         * Graduated formula (not flat!):
         *   50% tier: taxable = min(50% of benefits, 50% of excess over $25k)
         *   85% tier: taxable = min(85% of benefits, $4,500 + 85% of excess over $34k)
         *
         * WHY THIS MATTERS: During memory care, IRA withdrawals drop (lifestyle
         * covered by facility), pushing Person A from 85% tier toward 50% or lower.
         * The graduated formula means the difference can be $30k+ in taxable income.
         */
        provisionalIncomeTiers: [
            { threshold: 0, taxableFraction: 0 },         // Below $25k: not taxed
            { threshold: 25000, taxableFraction: 0.50 },   // $25k-$34k: graduated up to 50%
            { threshold: 34000, taxableFraction: 0.85 }    // Above $34k: graduated up to 85%
        ]
    },

    nursing: {
        /**
         * At-home nursing cost - low intensity tier
         * WHY: Person A's care needs before intensification (first half of LTC period)
         * DECISION: Slider-controllable in future; affects cash burn rate
         * PHASE 4: Will add scenario override for this value
         */
        lowAnnual: 30000,

        /**
         * At-home nursing cost - high intensity tier
         * WHY: Person A's care needs after intensification (second half of LTC period)
         * DECISION: Higher intensity care costs more; triggers faster asset depletion
         * PHASE 4: Will add scenario override for this value
         */
        highAnnual: 70000
    }
};

const SPENDING_STRATEGY = {
    /**
     * LTC/IRA split ratio when both available
     * WHY: Current "dumb" strategy - always 50/50 split
     * LIMITATION: Ignores tax implications of IRA withdrawals
     * PHASE 3: Will optimize to minimize taxes (might be 70/30 or 20/80)
     * DECISION: More LTC = less taxable income = lower taxes
     *
     * Example impact:
     *   - $68k shortfall with 50/50: $34k from each
     *   - $68k shortfall with 80/20: $54k LTC, $14k IRA
     *   - Tax savings from less IRA: ~$4k-$8k/year
     */
    ltcIraSplitRatio: 0.5,

    /**
     * IRA withdrawal priority order
     * WHY: SDIRA is cash (no market risk), drain first
     * DECISION: Could change priority if market conditions favorable
     *
     * Rationale:
     *   - SDIRA Checking earns ~0% (cash)
     *   - ManagedIRA grows at ~4% (invested)
     *   - Draining cash first preserves growth potential
     *   - SDIRA also receives annuity payments (gets replenished)
     */
    iraWithdrawalPriority: ['sdira_checking', 'managed_ira'],

    /**
     * Default IRA growth rate (if not specified in scenario)
     * WHY: Conservative estimate for diversified portfolio
     * DECISION: Higher rate = more optimistic projection
     */
    defaultIraGrowthRate: 0.04,

    /**
     * Default HELOC interest rate
     * WHY: Home equity line of credit rate (variable)
     * DECISION: Higher rate = more expensive to borrow against house
     */
    defaultHelocRate: 0.075
};

const REAL_ESTATE_CONSTANTS = {
    /**
     * IRS residential rental depreciation period (years)
     * WHY: IRS rule for residential rental property straight-line depreciation
     * TAX STRATEGY: Depreciation offsets rental income, reduces taxes
     * DECISION: Shows why keeping rental property has tax benefits
     */
    residentialDepreciationYears: 27.5,

    /**
     * Building vs land value ratio for depreciation
     * WHY: Only building depreciates (land does not)
     * DECISION: Affects annual depreciation deduction amount
     * NOTE: 80/20 is a common estimate; actual ratio varies by property
     */
    buildingValueRatio: 0.8,

    /**
     * HELOC maximum loan-to-value ratio
     * WHY: Lenders typically allow borrowing up to 80% of home value
     * DECISION: Higher equity = more HELOC capacity before property sale
     */
    helocMaxLtv: 0.80,

    /**
     * Debt threshold that triggers condo sale consideration
     * WHY: When total debt on house exceeds 60% LTV, consider selling condo
     * DECISION: Selling condo pays down debt before becoming overleveraged
     */
    condoSaleDebtThreshold: 0.60,

    /**
     * Property sale cost haircut (selling costs)
     * WHY: Agent commissions, closing costs, repairs = ~5% of sale price
     * DECISION: Net proceeds = Sale Price * 0.95
     */
    sellingCostHaircut: 0.05,

    /**
     * Default primary house appreciation rate
     * WHY: Historical average for Portland area residential
     * DECISION: Higher appreciation = more equity = more HELOC capacity
     */
    defaultHouseAppreciation: 0.06,

    /**
     * Default condo appreciation rate
     * WHY: Condos typically appreciate slightly slower than houses
     * DECISION: Affects long-term asset value projections
     */
    defaultCondoAppreciation: 0.05
};

const MEMORY_CARE_CONSTANTS = {
    /**
     * Default base annual memory care cost (2026 dollars)
     * WHY: Average memory care facility in Portland area
     * DECISION: Major expense driver - more than lifestyle was
     */
    defaultAnnualCost: 120000,

    /**
     * Default memory care inflation rate
     * WHY: Healthcare inflation typically exceeds general inflation
     * DECISION: Higher rate = faster cost growth = earlier asset depletion
     */
    defaultInflationRate: 0.05,

    /**
     * Base year for inflation calculations
     * WHY: All costs inflate from this year regardless of start date
     * DECISION: Ensures consistent cost projections across scenarios
     */
    baseYear: 2026,

    /**
     * Medical expense tier: base (pre-LTC)
     * WHY: Normal medical expenses before any health crisis
     * DECISION: Affects itemization decision (usually not enough to itemize)
     */
    baseMedicalMonthly: 200
};

const LTC_POLICY_CONSTANTS = {
    /**
     * Default LTC payout period (days)
     * WHY: Typical LTC policy provides ~4 years of coverage
     * DECISION: Longer coverage = more protection, but policy cost varies
     */
    defaultPayoutDays: 1460, // 4 years

    /**
     * Default LTC pool inflation rate
     * WHY: LTC policies often include inflation protection
     * DECISION: Inflating pool means more coverage in future dollars
     */
    defaultPoolInflation: 0.05
};

const MORTGAGE_CONSTANTS = {
    /**
     * Default mortgage term (months)
     * WHY: Standard 30-year mortgage
     * DECISION: Longer term = lower monthly payment, more total interest
     */
    defaultTermMonths: 360,

    /**
     * Default mortgage rate
     * WHY: Current market rate estimate for conventional mortgage
     * DECISION: Rate affects monthly payment and total interest paid
     */
    defaultRate: 0.060,

    /**
     * Default management fee rate for rental property
     * WHY: Property management companies typically charge 8-10%
     * DECISION: Higher fee = less net rental income
     */
    defaultManagementFeeRate: 0.08
};

const PROJECTION_CONSTANTS = {
    /**
     * Base year for all projections
     * WHY: Current year / projection start year
     * DECISION: All calculations reference this as "year 0"
     */
    baseYear: 2026,

    /**
     * Person A's age in base year
     * WHY: Used for age-based calculations (RMD, etc.)
     * DECISION: Affects when certain rules kick in
     */
    baseYearAgeA: 70
};

/**
 * Cash-depleted scenario result enumerations
 * WHY: Testable enum-driven labels for the "Cash Assets Depleted" annotation
 * All 3 current scenarios use REAL_ESTATE_LIQUIDATION_IMMINENT because
 * Person A always owns the primary house (even after Arbor Roses is sold).
 * MEDICAID_BEGINS is reserved for a future Medicaid guardrail scenario.
 */
const CASH_DEPLETED_RESULTS = {
    REAL_ESTATE_LIQUIDATION_IMMINENT: 'real_estate_liquidation_imminent',
    MEDICAID_BEGINS: 'medicaid_begins',
};

const CASH_DEPLETED_MESSAGES = {
    real_estate_liquidation_imminent: 'Partial real estate liquidation imminent',
    medicaid_begins: 'Medicaid begins',
};

module.exports = {
    TAX_CONSTANTS,
    SPENDING_STRATEGY,
    REAL_ESTATE_CONSTANTS,
    MEMORY_CARE_CONSTANTS,
    LTC_POLICY_CONSTANTS,
    MORTGAGE_CONSTANTS,
    PROJECTION_CONSTANTS,
    CASH_DEPLETED_RESULTS,
    CASH_DEPLETED_MESSAGES
};

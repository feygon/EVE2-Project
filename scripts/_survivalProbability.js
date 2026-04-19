/**
 * @file _survivalProbability.js
 * @description Pure function for AD-specific survival probability lookup.
 *   Returns P(alive) for each projection year, based on published Alzheimer's
 *   disease survival data adjusted for cognitive reserves.
 *
 * Sources:
 *   - PMC multistate analysis: https://pmc.ncbi.nlm.nih.gov/articles/PMC7717539/
 *   - Brookmeyer et al. 2002: https://jamanetwork.com/journals/jamaneurology/fullarticle/783112
 *   - AD progression rates: https://pmc.ncbi.nlm.nih.gov/articles/PMC6156780/
 *   - Survival meta-analysis: https://www.nature.com/articles/s41398-024-02897-w
 *
 * @DECISION Person A: MCI diagnosis ~2024, age 69, female, significant cognitive reserves.
 *   Cognitive reserve adjustment: +2 years median shift per meta-analysis finding.
 *   Stage-specific annual mortality: MCI 8%, Mild AD 5.5%, Moderate 21.5%, Severe 48%.
 */

/**
 * Survival probability tables keyed by years-post-diagnosis.
 * Derived from published AD survival data + stage-specific mortality rates.
 */
const SURVIVAL_TABLES = {
    // MCI with cognitive reserves (female, educated): +2yr median shift
    // Derived from PMC multistate analysis + Brookmeyer age-70 curve + reserve adjustment
    mci_with_reserves: [
        { yearsPost: 0, prob: 1.00 },
        { yearsPost: 1, prob: 0.98 },
        { yearsPost: 2, prob: 0.97 },  // Still MCI, low mortality
        { yearsPost: 3, prob: 0.94 },  // MCI→Mild AD conversion beginning
        { yearsPost: 4, prob: 0.89 },  // Mild AD, 5.5% annual mortality
        { yearsPost: 5, prob: 0.84 },
        { yearsPost: 6, prob: 0.76 },  // Mild→Moderate transition
        { yearsPost: 7, prob: 0.64 },  // Moderate AD, 21.5% annual mortality
        { yearsPost: 8, prob: 0.50 },  // Median survival point
        { yearsPost: 9, prob: 0.39 },
        { yearsPost: 10, prob: 0.30 }, // Moderate→Severe transition
        { yearsPost: 11, prob: 0.20 }, // Severe AD, 48% annual mortality
        { yearsPost: 12, prob: 0.12 },
        { yearsPost: 13, prob: 0.07 },
        { yearsPost: 14, prob: 0.04 },
        { yearsPost: 15, prob: 0.02 },
        { yearsPost: 16, prob: 0.01 }
    ],

    // MCI without cognitive reserves: no median shift
    mci: [
        { yearsPost: 0, prob: 1.00 },
        { yearsPost: 1, prob: 0.96 },
        { yearsPost: 2, prob: 0.92 },
        { yearsPost: 3, prob: 0.85 },
        { yearsPost: 4, prob: 0.76 },
        { yearsPost: 5, prob: 0.64 },
        { yearsPost: 6, prob: 0.51 },  // Median survival point (earlier)
        { yearsPost: 7, prob: 0.40 },
        { yearsPost: 8, prob: 0.30 },
        { yearsPost: 9, prob: 0.21 },
        { yearsPost: 10, prob: 0.14 },
        { yearsPost: 11, prob: 0.08 },
        { yearsPost: 12, prob: 0.04 },
        { yearsPost: 13, prob: 0.02 },
        { yearsPost: 14, prob: 0.01 },
        { yearsPost: 15, prob: 0.005 },
        { yearsPost: 16, prob: 0.002 }
    ]
};

/**
 * Get survival probability for a specific projection year.
 *
 * @param {number} year - Calendar year (e.g., 2028)
 * @param {number} diagnosisYear - Year of MCI diagnosis (e.g., 2024)
 * @param {string} [stage='mci_with_reserves'] - Stage key from SURVIVAL_TABLES
 * @returns {number} P(alive) between 0.0 and 1.0
 */
function getSurvivalProbability(year, diagnosisYear, stage) {
    stage = stage || 'mci_with_reserves';
    const table = SURVIVAL_TABLES[stage];
    if (!table) return 0.0;

    const yearsPost = year - diagnosisYear;

    // Before diagnosis: 100% survival
    if (yearsPost < 0) return 1.0;

    // Beyond table: return 0.0
    const lastEntry = table[table.length - 1];
    if (yearsPost > lastEntry.yearsPost) return 0.0;

    // Exact match
    const entry = table.find(e => e.yearsPost === yearsPost);
    if (entry) return entry.prob;

    // Linear interpolation between surrounding entries
    for (let i = 0; i < table.length - 1; i++) {
        if (table[i].yearsPost <= yearsPost && table[i + 1].yearsPost > yearsPost) {
            const t = (yearsPost - table[i].yearsPost) / (table[i + 1].yearsPost - table[i].yearsPost);
            return table[i].prob + t * (table[i + 1].prob - table[i].prob);
        }
    }

    return 0.0;
}

/**
 * Pre-compute survival probability array for the full projection horizon.
 *
 * @param {number} startYear - First projection year (e.g., 2026)
 * @param {number} endYear - Last projection year (e.g., 2040), typically from year_of_passing slider
 * @param {number} diagnosisYear - Year of MCI diagnosis (e.g., 2024)
 * @param {string} [stage='mci_with_reserves'] - Stage key
 * @returns {Object.<number, number>} Map of year → P(alive)
 */
function precomputeSurvivalArray(startYear, endYear, diagnosisYear, stage) {
    const result = {};
    for (let year = startYear; year <= endYear; year++) {
        result[year] = getSurvivalProbability(year, diagnosisYear, stage);
    }
    return result;
}

module.exports = {
    getSurvivalProbability,
    precomputeSurvivalArray,
    SURVIVAL_TABLES
};

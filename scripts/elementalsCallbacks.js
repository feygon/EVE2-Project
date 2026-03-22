// elementalsCallbacks.js
const fs = require('fs').promises;
const path = require('path');
const config = require('./elementals-config');

// Path to the elementals data JSON
const ELEMENTALS_DATA_PATH = path.join(__dirname, '..', config.DATA_PATH);

// Cache configuration from config file
const CACHE_DURATION = config.CACHE_DURATION_MS;
const MAX_RETRY_ATTEMPTS = config.MAX_RETRY_ATTEMPTS;
const RETRY_DELAY = config.RETRY_DELAY_MS;

// Cache the elementals data in memory
let elementalsCache = null;
let lastLoadTime = null;
let isLoading = false;
let loadPromise = null;

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const elementalsCallbacks = {
    /**
     * Load elementals data from JSON file with caching and retry logic
     * @param {boolean} forceReload - Force reload even if cache is valid
     * @returns {Promise<Object>} The parsed elementals data object
     * @throws {Error} If the file cannot be read or parsed after all retry attempts
     */
    loadElementalsData: async function(forceReload = false) {
        const now = Date.now();

        // Return cached data if still valid and not forcing reload
        if (!forceReload && elementalsCache && lastLoadTime && (now - lastLoadTime < CACHE_DURATION)) {
            return elementalsCache;
        }

        // If already loading, wait for that promise
        if (isLoading && loadPromise) {
            return loadPromise;
        }

        // Start loading
        isLoading = true;
        loadPromise = this._loadWithRetry();

        try {
            const result = await loadPromise;
            return result;
        } finally {
            isLoading = false;
            loadPromise = null;
        }
    },

    /**
     * Internal method to load data with retry logic
     * @private
     * @returns {Promise<Object>} The parsed elementals data
     */
    _loadWithRetry: async function() {
        let lastError = null;

        for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                const data = await fs.readFile(ELEMENTALS_DATA_PATH, 'utf-8');
                const parsed = JSON.parse(data);

                // Validate data structure
                if (!parsed.elementals || !Array.isArray(parsed.elementals)) {
                    throw new Error('Invalid data structure: missing elementals array');
                }

                // Update cache
                elementalsCache = parsed;
                lastLoadTime = Date.now();

                if (attempt > 1) {
                    console.log(`Successfully loaded elementals data on attempt ${attempt}`);
                }

                return parsed;
            } catch (error) {
                lastError = error;
                console.error(`Error loading elementals data (attempt ${attempt}/${MAX_RETRY_ATTEMPTS}):`, error.message);

                if (attempt < MAX_RETRY_ATTEMPTS) {
                    await sleep(RETRY_DELAY * attempt);
                }
            }
        }

        // If we have stale cache, return it as fallback
        if (elementalsCache) {
            console.warn('Using stale cache after failed reload attempts');
            return elementalsCache;
        }

        throw new Error(`Failed to load elementals data after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError.message}`);
    },

    /**
     * Clear the cache (useful for testing or forced refresh)
     */
    clearCache: function() {
        elementalsCache = null;
        lastLoadTime = null;
        console.log('Elementals cache cleared');
    },

    /**
     * Get the main elementals page with all data
     * @param {Object} res - Express response object
     * @param {Object} context - Handlebars template context to populate
     * @param {Function} complete - Callback to invoke after context is populated
     * @returns {Promise<void>}
     */
    getElementalsPage: async function(res, context, complete) {
        try {
            console.log('[Elementals] Loading elementals data...');
            console.log('[Elementals] Data path:', ELEMENTALS_DATA_PATH);

            const data = await this.loadElementalsData();
            /* istanbul ignore next */
            console.log('[Elementals] Data loaded successfully, elementals count:', data.elementals ? data.elementals.length : 0);

            // Get unique traits for filtering
            const allTraits = new Set();
            if (data.trait_index) {
                Object.keys(data.trait_index).forEach(trait => allTraits.add(trait));
            }

            // Get level range from all versions
            const levels = data.elementals.map(e => {
                const versions = [e.versions.normal.level];
                if (e.versions.weak) versions.push(e.versions.weak.level);
                if (e.versions.elite) versions.push(e.versions.elite.level);
                return versions;
            }).reduce((acc, val) => acc.concat(val), []);

            const minLevel = Math.min(...levels);
            const maxLevel = Math.max(...levels);

            console.log('[Elementals] Level range:', minLevel, '-', maxLevel);
            console.log('[Elementals] Traits count:', allTraits.size);

            // Split traits into categorized groups
            const sortedTraits = Array.from(allTraits).sort();
            const elementalTraits = sortedTraits.filter(t => config.ELEMENTAL_TRAITS.includes(t));
            const creatureTypeTraits = sortedTraits.filter(t => config.CREATURE_TYPE_TRAITS.includes(t));
            const rarityTraits = sortedTraits.filter(t => config.RARITY_TRAITS.includes(t));
            const otherTraits = sortedTraits.filter(t =>
                !config.ELEMENTAL_TRAITS.includes(t) &&
                !config.CREATURE_TYPE_TRAITS.includes(t) &&
                !config.RARITY_TRAITS.includes(t)
            );

            // Populate context for template
            context.metadata = data.metadata;
            context.elementals = data.elementals;
            context.traits = sortedTraits;
            context.elementalTraits = elementalTraits;
            context.creatureTypeTraits = creatureTypeTraits;
            context.rarityTraits = rarityTraits;
            context.otherTraits = otherTraits;
            context.minLevel = minLevel;
            context.maxLevel = maxLevel;
            context.aonprdBaseUrl = config.AONPRD_BASE_URL;

            complete();

        } catch (error) {
            console.error('[Elementals] ERROR in getElementalsPage:', error);
            console.error('[Elementals] Error stack:', error.stack);
            res.status(500).send('Failed to load elemental data. Please try again later.');
        }
    },

    /**
     * Filter elementals based on query parameters
     * @param {Object} req - Express request object with query parameters
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with filtered elementals
     */
    filterElementals: async function(req, res) {
        try {
            const data = await this.loadElementalsData();
            const { level, trait, size, minHp, maxHp, hasFlying, hasSwimming, hasBurrowing, hasClimbing, keyword } = req.query;

            let filtered = data.elementals;

            // Filter by keyword (searches name, abilities, summary, traits, senses)
            if (keyword) {
                const kw = keyword.toLowerCase();
                filtered = filtered.filter(elemental => {
                    const n = elemental.versions.normal;
                    return n.name.toLowerCase().includes(kw) ||
                           (n.abilities && n.abilities.some(a => a.toLowerCase().includes(kw))) ||
                           (n.summary && n.summary.toLowerCase().includes(kw)) ||
                           (n.traits && n.traits.some(t => t.toLowerCase().includes(kw))) ||
                           (n.senses && n.senses.some(s => s.toLowerCase().includes(kw))) ||
                           (n.spell && n.spell.some(s => s.toLowerCase().includes(kw))) ||
                           (n.immunities && n.immunities.some(i => i.toLowerCase().includes(kw))) ||
                           (n.resistances && n.resistances.some(r => r.toLowerCase().includes(kw))) ||
                           (n.weaknesses && n.weaknesses.some(w => w.toLowerCase().includes(kw)));
                });
            }

            // Filter by level (checks all versions) and tag matched version
            if (level) {
                const targetLevel = parseInt(level);
                filtered = filtered.filter(elemental => {
                    return elemental.versions.normal.level === targetLevel ||
                           (elemental.versions.weak && elemental.versions.weak.level === targetLevel) ||
                           (elemental.versions.elite && elemental.versions.elite.level === targetLevel);
                });
                // Tag each creature with which version matched
                filtered = filtered.map(elemental => {
                    let matchedVersion = 'normal';
                    if (elemental.versions.normal.level === targetLevel) {
                        matchedVersion = 'normal';
                    } else if (elemental.versions.elite && elemental.versions.elite.level === targetLevel) {
                        matchedVersion = 'elite';
                    } else if (elemental.versions.weak && elemental.versions.weak.level === targetLevel) {
                        matchedVersion = 'weak';
                    }
                    return { ...elemental, matchedVersion };
                });
            }

            // Filter by trait (comma-separated, OR logic)
            if (trait) {
                const selectedTraits = trait.split(',').map(t => t.trim()).filter(Boolean);
                if (selectedTraits.length > 0) {
                    filtered = filtered.filter(elemental =>
                        elemental.versions.normal.traits &&
                        selectedTraits.some(t => elemental.versions.normal.traits.includes(t))
                    );
                }
            }

            // Filter by size
            if (size) {
                filtered = filtered.filter(elemental =>
                    elemental.versions.normal.size === size
                );
            }

            // Filter by HP range
            if (minHp) {
                const min = parseInt(minHp);
                filtered = filtered.filter(elemental =>
                    elemental.versions.normal.hp >= min
                );
            }

            if (maxHp) {
                const max = parseInt(maxHp);
                filtered = filtered.filter(elemental =>
                    elemental.versions.normal.hp <= max
                );
            }

            // Filter by flying capability
            if (hasFlying === 'true') {
                filtered = filtered.filter(elemental =>
                    elemental.versions.normal.speed.fly && elemental.versions.normal.speed.fly > 0
                );
            }

            // Filter by climbing capability
            if (hasClimbing === 'true') {
                filtered = filtered.filter(elemental =>
                    elemental.versions.normal.speed.climb && elemental.versions.normal.speed.climb > 0
                );
            }

            // Filter by burrowing capability
            if (hasBurrowing === 'true') {
                filtered = filtered.filter(elemental =>
                    elemental.versions.normal.speed.burrow && elemental.versions.normal.speed.burrow > 0
                );
            }

            // Filter by swimming capability
            if (hasSwimming === 'true') {
                filtered = filtered.filter(elemental =>
                    elemental.versions.normal.speed.swim && elemental.versions.normal.speed.swim > 0
                );
            }

            res.json({
                count: filtered.length,
                elementals: filtered
            });

        } catch (error) {
            console.error('Error in filterElementals:', error);
            res.status(500).json({
                error: 'Failed to fetch elementals',
                message: 'Please try again or contact support if the problem persists.'
            });
        }
    },

    /**
     * Get detailed info for a specific elemental
     * @param {Object} req - Express request object with elemental ID in params
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with elemental details
     */
    getElementalDetail: async function(req, res) {
        try {
            const data = await this.loadElementalsData();
            const elemental = data.elementals.find(e => e.id === req.params.id);

            if (!elemental) {
                return res.status(404).json({
                    error: 'Elemental not found',
                    message: `No elemental found with ID: ${req.params.id}`
                });
            }

            res.json(elemental);

        } catch (error) {
            console.error('Error in getElementalDetail:', error);
            res.status(500).json({
                error: 'Failed to fetch elemental details',
                message: 'Please try again or contact support if the problem persists.'
            });
        }
    }
};

module.exports = elementalsCallbacks;

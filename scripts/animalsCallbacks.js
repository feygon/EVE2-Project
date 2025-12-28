// animalsCallbacks.js
const fs = require('fs').promises;
const path = require('path');
const config = require('./animals-config');

// Path to the animals data JSON
const ANIMALS_DATA_PATH = path.join(__dirname, '..', config.DATA_PATH);

// Cache configuration from config file
const CACHE_DURATION = config.CACHE_DURATION_MS;
const MAX_RETRY_ATTEMPTS = config.MAX_RETRY_ATTEMPTS;
const RETRY_DELAY = config.RETRY_DELAY_MS;

// Cache the animals data in memory
let animalsCache = null;
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

const animalsCallbacks = {
    /**
     * Load animals data from JSON file with caching and retry logic
     * @param {boolean} forceReload - Force reload even if cache is valid
     * @returns {Promise<Object>} The parsed animals data object containing metadata, trait_index, and animals array
     * @throws {Error} If the file cannot be read or parsed after all retry attempts
     */
    loadAnimalsData: async function(forceReload = false) {
        const now = Date.now();
        
        // Return cached data if still valid and not forcing reload
        if (!forceReload && animalsCache && lastLoadTime && (now - lastLoadTime < CACHE_DURATION)) {
            return animalsCache;
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
     * @returns {Promise<Object>} The parsed animals data
     */
    _loadWithRetry: async function() {
        let lastError = null;
        
        for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                const data = await fs.readFile(ANIMALS_DATA_PATH, 'utf-8');
                const parsed = JSON.parse(data);
                
                // Validate data structure
                if (!parsed.animals || !Array.isArray(parsed.animals)) {
                    throw new Error('Invalid data structure: missing animals array');
                }
                
                // Update cache
                animalsCache = parsed;
                lastLoadTime = Date.now();
                
                if (attempt > 1) {
                    console.log(`Successfully loaded animals data on attempt ${attempt}`);
                }
                
                return parsed;
            } catch (error) {
                lastError = error;
                console.error(`Error loading animals data (attempt ${attempt}/${MAX_RETRY_ATTEMPTS}):`, error.message);
                
                if (attempt < MAX_RETRY_ATTEMPTS) {
                    await sleep(RETRY_DELAY * attempt); // Exponential backoff
                }
            }
        }
        
        // If we have stale cache, return it as fallback
        if (animalsCache) {
            console.warn('Using stale cache after failed reload attempts');
            return animalsCache;
        }
        
        throw new Error(`Failed to load animals data after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError.message}`);
    },

    /**
     * Clear the cache (useful for testing or forced refresh)
     */
    clearCache: function() {
        animalsCache = null;
        lastLoadTime = null;
        console.log('Animals cache cleared');
    },

    /**
     * Get the main animals page with all data
     * @param {Object} res - Express response object
     * @param {Object} context - Handlebars template context to populate
     * @param {Function} complete - Callback to invoke after context is populated
     * @returns {Promise<void>}
     */
    getAnimalsPage: async function(res, context, complete) {
        try {
            console.log('[Animals] Loading animals data...');
            console.log('[Animals] Data path:', ANIMALS_DATA_PATH);
            
            const data = await this.loadAnimalsData();
            console.log('[Animals] Data loaded successfully, animals count:', data.animals?.length);
            
            // Get unique traits for filtering
            const allTraits = new Set();
            if (data.trait_index) {
                Object.keys(data.trait_index).forEach(trait => allTraits.add(trait));
            }
            
            // Get level range from all animal versions
            const levels = data.animals.map(a => {
                const versions = [a.versions.normal.level];
                if (a.versions.weak) versions.push(a.versions.weak.level);
                versions.push(a.versions.elite.level);
                return versions;
            }).reduce((acc, val) => acc.concat(val), []); // Flatten the array (Node 10 compatible)
            
            const minLevel = Math.min(...levels);
            const maxLevel = Math.max(...levels);
            
            console.log('[Animals] Level range:', minLevel, '-', maxLevel);
            console.log('[Animals] Traits count:', allTraits.size);
            
            // Populate context for template
            context.metadata = data.metadata;
            context.animals = data.animals;
            context.traits = Array.from(allTraits).sort();
            context.minLevel = minLevel;
            context.maxLevel = maxLevel;
            
            complete();
            
        } catch (error) {
            console.error('[Animals] ERROR in getAnimalsPage:', error);
            console.error('[Animals] Error stack:', error.stack);
            res.status(500).send('Failed to load animal data. Please try again later.');
        }
    },

    /**
     * Filter animals based on query parameters
     * @param {Object} req - Express request object with query parameters
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with filtered animals
     * 
     * @description
     * Supported query parameters:
     * - level {number} - Filter by spell level (checks all versions)
     * - trait {string} - Filter by trait name
     * - size {string} - Filter by size (Tiny, Small, Medium, Large, Huge, Gargantuan)
     * - minHp {number} - Minimum HP threshold
     * - maxHp {number} - Maximum HP threshold
     * - hasFlying {string} - Filter creatures with fly speed ("true")
     * - hasSwimming {string} - Filter creatures with swim speed ("true")
     */
    filterAnimals: async function(req, res) {
        try {
            const data = await this.loadAnimalsData();
            const { level, trait, size, minHp, maxHp, hasFlying, hasSwimming } = req.query;
            
            let filtered = data.animals;
            
            // Filter by level (checks all versions)
            if (level) {
                const targetLevel = parseInt(level);
                filtered = filtered.filter(animal => {
                    return animal.versions.normal.level === targetLevel ||
                           (animal.versions.weak && animal.versions.weak.level === targetLevel) ||
                           animal.versions.elite.level === targetLevel;
                });
            }
            
            // Filter by trait
            if (trait) {
                filtered = filtered.filter(animal => 
                    animal.versions.normal.traits && 
                    animal.versions.normal.traits.includes(trait)
                );
            }
            
            // Filter by size
            if (size) {
                filtered = filtered.filter(animal => 
                    animal.versions.normal.size === size
                );
            }
            
            // Filter by HP range (normal version only)
            if (minHp) {
                const min = parseInt(minHp);
                filtered = filtered.filter(animal => 
                    animal.versions.normal.hp >= min
                );
            }
            
            if (maxHp) {
                const max = parseInt(maxHp);
                filtered = filtered.filter(animal => 
                    animal.versions.normal.hp <= max
                );
            }
            
            // Filter by flying capability
            if (hasFlying === 'true') {
                filtered = filtered.filter(animal => 
                    animal.versions.normal.speed.fly && animal.versions.normal.speed.fly > 0
                );
            }
            
            // Filter by swimming capability
            if (hasSwimming === 'true') {
                filtered = filtered.filter(animal => 
                    animal.versions.normal.speed.swim && animal.versions.normal.speed.swim > 0
                );
            }
            
            res.json({
                count: filtered.length,
                animals: filtered
            });
            
        } catch (error) {
            console.error('Error in filterAnimals:', error);
            res.status(500).json({ 
                error: 'Failed to fetch animals',
                message: 'Please try again or contact support if the problem persists.'
            });
        }
    },

    /**
     * Get detailed info for a specific animal
     * @param {Object} req - Express request object with animal ID in params
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with animal details
     */
    getAnimalDetail: async function(req, res) {
        try {
            const data = await this.loadAnimalsData();
            const animal = data.animals.find(a => a.id === req.params.id);
            
            if (!animal) {
                return res.status(404).json({ 
                    error: 'Animal not found',
                    message: `No animal found with ID: ${req.params.id}`
                });
            }
            
            res.json(animal);
            
        } catch (error) {
            console.error('Error in getAnimalDetail:', error);
            res.status(500).json({ 
                error: 'Failed to fetch animal details',
                message: 'Please try again or contact support if the problem persists.'
            });
        }
    }
};

module.exports = animalsCallbacks;

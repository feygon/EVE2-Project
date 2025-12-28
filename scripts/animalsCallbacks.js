// animalsCallbacks.js
const fs = require('fs').promises;
const path = require('path');

// Path to the animals data JSON
const ANIMALS_DATA_PATH = path.join(__dirname, '..', 'Extras', 'animals-data.json');

// Cache the animals data in memory
let animalsCache = null;
let lastLoadTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const animalsCallbacks = {
    /**
     * Load animals data from JSON file with caching
     */
    loadAnimalsData: async function() {
        const now = Date.now();
        
        // Return cached data if still valid
        if (animalsCache && lastLoadTime && (now - lastLoadTime < CACHE_DURATION)) {
            return animalsCache;
        }
        
        try {
            const data = await fs.readFile(ANIMALS_DATA_PATH, 'utf-8');
            const parsed = JSON.parse(data);
            
            animalsCache = parsed;
            lastLoadTime = now;
            
            return parsed;
        } catch (error) {
            console.error('Error loading animals data:', error);
            throw new Error('Failed to load animals data');
        }
    },

    /**
     * Get the main animals page with all data
     */
    getAnimalsPage: async function(res, context, complete) {
        try {
            const data = await this.loadAnimalsData();
            
            // Get unique traits for filtering
            const allTraits = new Set();
            if (data.trait_index) {
                Object.keys(data.trait_index).forEach(trait => allTraits.add(trait));
            }
            
            // Get level range
            const levels = data.animals.flatMap(a => {
                const versions = [a.versions.normal.level];
                if (a.versions.weak) versions.push(a.versions.weak.level);
                versions.push(a.versions.elite.level);
                return versions;
            });
            
            const minLevel = Math.min(...levels);
            const maxLevel = Math.max(...levels);
            
            // Populate context
            context.metadata = data.metadata;
            context.animals = data.animals;
            context.traits = Array.from(allTraits).sort();
            context.minLevel = minLevel;
            context.maxLevel = maxLevel;
            
            complete();
            
        } catch (error) {
            console.error('Error in getAnimalsPage:', error);
            res.status(500).send('Failed to load animal data');
        }
    },

    /**
     * Filter animals based on query parameters
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
            
            // Filter by HP range
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
            
            // Filter by flying
            if (hasFlying === 'true') {
                filtered = filtered.filter(animal => 
                    animal.versions.normal.speed.fly && animal.versions.normal.speed.fly > 0
                );
            }
            
            // Filter by swimming
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
            res.status(500).json({ error: 'Failed to fetch animals' });
        }
    },

    /**
     * Get detailed info for a specific animal
     */
    getAnimalDetail: async function(req, res) {
        try {
            const data = await this.loadAnimalsData();
            const animal = data.animals.find(a => a.id === req.params.id);
            
            if (!animal) {
                return res.status(404).json({ error: 'Animal not found' });
            }
            
            res.json(animal);
            
        } catch (error) {
            console.error('Error in getAnimalDetail:', error);
            res.status(500).json({ error: 'Failed to fetch animal details' });
        }
    }
};

module.exports = animalsCallbacks;

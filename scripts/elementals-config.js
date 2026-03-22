/**
 * Configuration constants for the Elementals tool
 */

module.exports = {
    // External References
    AONPRD_BASE_URL: 'https://2e.aonprd.com',

    // Data file paths
    DATA_PATH: 'Extras/elementals-data.json',

    // Cache settings
    CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes

    // Retry settings
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000, // 1 second base delay

    // API endpoints
    API_ROUTES: {
        BASE: '/elementals',
        LIST: '/elementals/api/list',
        DETAIL: '/elementals/api/detail/:id'
    },

    // Filter parameters
    FILTER_PARAMS: {
        LEVEL: 'level',
        TRAIT: 'trait',
        SIZE: 'size',
        MIN_HP: 'minHp',
        MAX_HP: 'maxHp',
        HAS_FLYING: 'hasFlying',
        HAS_SWIMMING: 'hasSwimming'
    },

    // Valid size values
    VALID_SIZES: ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'],

    // Core elemental sub-type traits
    ELEMENTAL_TRAITS: ['Air', 'Cold', 'Earth', 'Fire', 'Metal', 'Plant', 'Water', 'Wood'],

    // Creature type traits
    CREATURE_TYPE_TRAITS: ['Animal', 'Beast', 'Construct', 'Demon', 'Dragon', 'Fiend', 'Genie', 'Humanoid', 'Incorporeal', 'Spirit', 'Swarm', 'Undead'],

    // Rarity traits
    RARITY_TRAITS: ['Common', 'Uncommon', 'Rare', 'Unique']
};

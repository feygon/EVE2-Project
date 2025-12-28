/**
 * Configuration constants for the Animals tool
 */

module.exports = {
    // Data file paths
    DATA_PATH: 'Extras/animals-data.json',
    
    // Cache settings
    CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
    
    // Retry settings
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000, // 1 second base delay
    
    // API endpoints
    API_ROUTES: {
        BASE: '/animals',
        LIST: '/animals/api/list',
        DETAIL: '/animals/api/detail/:id'
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
    
    // Animal versions
    VERSIONS: {
        NORMAL: 'normal',
        WEAK: 'weak',
        ELITE: 'elite'
    }
};

/**
 * Test setup - runs before all tests
 * Configures Chai and global test helpers
 * 
 * IMPORTANT: This file ONLY affects test execution, NOT your live app!
 * The console.log suppression below only runs during test execution.
 * Your production app (main.js) is completely unaffected.
 */

const chai = require('chai');
const sinonChai = require('sinon-chai');

// Configure Chai
chai.use(sinonChai);

// Export assertion styles for use in all test files
global.expect = chai.expect;
global.assert = chai.assert;

// Suppress console output during tests for cleaner test results
// This ONLY affects test environment, NOT your production app
// To see console output during tests, run: DEBUG=true npm test
if (!process.env.DEBUG) {
    global.console.log = () => {};    // Suppress console.log during tests
    global.console.error = () => {};  // Suppress console.error during tests
}

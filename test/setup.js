/**
 * Test setup - runs before all tests
 * Configures Chai and global test helpers
 */

const chai = require('chai');
const sinonChai = require('sinon-chai');

// Configure Chai
chai.use(sinonChai);

// Export assertion styles
global.expect = chai.expect;
global.assert = chai.assert;

// Suppress console.log in tests unless DEBUG=true
if (!process.env.DEBUG) {
    global.console.log = () => {};
    global.console.error = () => {};
}

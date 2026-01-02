# ?? Testing Guide for RealFeygon.com

**Created:** 2026-01-02  
**Framework:** Mocha + Chai + Sinon  
**Coverage Tool:** NYC (Istanbul)

---

## ?? Table of Contents

1. [Getting Started](#getting-started)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Writing New Tests](#writing-new-tests)
5. [Coverage Reports](#coverage-reports)
6. [CI/CD Integration](#cicd-integration)

---

## ?? Getting Started

### **Install Dependencies**

```bash
npm install
```

This installs:
- **mocha** - Test framework
- **chai** - Assertion library
- **sinon** - Mocking/stubbing
- **sinon-chai** - Chai assertions for Sinon
- **supertest** - HTTP integration testing
- **proxyquire** - Module mocking
- **nyc** - Code coverage

---

## ?? Running Tests

### **Run All Tests**
```bash
npm test
```

### **Run Unit Tests Only**
```bash
npm run test:unit
```

### **Run Integration Tests Only**
```bash
npm run test:integration
```

### **Run with Coverage Report**
```bash
npm run test:coverage
```

### **Run in Watch Mode (Development)**
```bash
npm run test:watch
```

### **Run Specific Test File**
```bash
npx mocha test/unit/helpers.test.js
```

### **Run Tests with Debugging**
```bash
DEBUG=true npm test
```

---

## ?? Test Structure

```
test/
??? setup.js                     # Global test configuration
??? mocha.opts                   # Mocha configuration
??? unit/
?   ??? helpers.test.js          # Handlebars helper tests
?   ??? animalsCallbacks.test.js # Animals callback tests
??? integration/
    ??? animals-api.test.js      # API endpoint tests
```

### **Test File Naming Convention**
- `*.test.js` - Test files
- `*.spec.js` - Alternative (not used currently)
- Group related tests in `describe()` blocks

---

## ?? Test Coverage

### **Current Coverage (as of 2026-01-02)**

| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| **helpers.js** | ?? Target: 100% | ?? Target: 100% | ?? Target: 100% | ?? Target: 100% |
| **animalsCallbacks.js** | ?? Target: 90% | ?? Target: 85% | ?? Target: 90% | ?? Target: 90% |
| **animals.js** | ?? Target: 80% | ?? Target: 75% | ?? Target: 80% | ?? Target: 80% |

### **Coverage Goals**
- **Critical modules (helpers):** 100%
- **Business logic (callbacks):** 90%
- **Routes:** 80%
- **Overall project:** 70% minimum

---

## ?? Writing New Tests

### **Unit Test Template**

```javascript
const { expect } = require('chai');
const sinon = require('sinon');

describe('Module Name', () => {
    describe('functionName()', () => {
        it('should do something specific', () => {
            // Arrange
            const input = 'test';
            
            // Act
            const result = myFunction(input);
            
            // Assert
            expect(result).to.equal('expected');
        });

        it('should handle edge case', () => {
            expect(() => myFunction(null)).to.throw();
        });
    });
});
```

### **Integration Test Template**

```javascript
const request = require('supertest');
const app = require('../../app');

describe('API Endpoint', () => {
    it('should return 200 status', (done) => {
        request(app)
            .get('/api/endpoint')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body).to.have.property('data');
            })
            .end(done);
    });
});
```

### **Best Practices**

? **DO:**
- Write descriptive test names (`should filter by level when level query param is provided`)
- Test both success and failure paths
- Use `beforeEach()` for common setup
- Clean up after tests (restore stubs, clear caches)
- Test edge cases (null, undefined, empty arrays)

? **DON'T:**
- Write tests that depend on external services (mock them)
- Test implementation details (test behavior, not internals)
- Write tests that depend on test execution order
- Leave console.log statements in tests

---

## ?? Mocking & Stubbing

### **Stub File System Operations**

```javascript
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const fsStub = {
    readFile: sinon.stub().resolves('{"data": "test"}')
};

const module = proxyquire('../../module', {
    'fs': { promises: fsStub }
});
```

### **Stub Express Request/Response**

```javascript
const req = {
    query: { filter: 'test' },
    params: { id: '123' }
};

const res = {
    json: sinon.stub(),
    status: sinon.stub().returnsThis(),
    send: sinon.stub()
};
```

### **Restore Stubs After Tests**

```javascript
afterEach(() => {
    sinon.restore(); // Restore all stubs
});
```

---

## ?? Coverage Reports

### **View HTML Coverage Report**

After running `npm run test:coverage`, open:

```
coverage/index.html
```

### **Coverage Thresholds**

Edit `.nycrc` to set thresholds:

```json
{
    "check-coverage": true,
    "lines": 80,
    "functions": 80,
    "branches": 75
}
```

### **Ignore Files from Coverage**

Create `.nycrc`:

```json
{
    "exclude": [
        "test/**",
        "public/**",
        "views/**",
        "**/node_modules/**"
    ]
}
```

---

## ?? Debugging Tests

### **Run Single Test with Debugging**

```bash
node --inspect-brk node_modules/.bin/mocha test/unit/helpers.test.js
```

Then attach your debugger (VS Code, Chrome DevTools).

### **Add Breakpoints**

```javascript
it('should do something', () => {
    debugger; // Pauses execution here
    const result = myFunction();
    expect(result).to.be.true;
});
```

### **View Console Output**

```bash
DEBUG=true npm test
```

---

## ?? CI/CD Integration

### **GitHub Actions Workflow**

The tests run automatically on:
- Every push to `main`
- Every pull request
- Manual workflow dispatch

See `.github/workflows/test.yml` for configuration.

### **Pre-commit Hook (Optional)**

Install Husky to run tests before commit:

```bash
npm install --save-dev husky
npx husky install
npx husky add .git/hooks/pre-commit "npm test"
```

---

## ?? Common Issues

### **Issue: Tests timeout**
**Solution:** Increase timeout in test or `mocha.opts`:
```javascript
it('slow test', function() {
    this.timeout(10000); // 10 seconds
    // ...
});
```

### **Issue: Module not found**
**Solution:** Check your `require()` paths are relative to test file location.

### **Issue: Stubs not working**
**Solution:** Make sure to `sinon.restore()` in `afterEach()`.

### **Issue: Tests pass locally but fail in CI**
**Solution:** Check for:
- File path case sensitivity (Linux vs Windows)
- Missing environment variables
- Different Node.js versions

---

## ?? Additional Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Styles](https://www.chaijs.com/api/)
- [Sinon.js Guides](https://sinonjs.org/releases/latest/)
- [Supertest API](https://github.com/visionmedia/supertest)
- [NYC Coverage](https://github.com/istanbuljs/nyc)

---

## ? Test Checklist for New Features

When adding new features, ensure:

- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] Edge cases covered (null, undefined, empty)
- [ ] Error handling tested
- [ ] Mocks/stubs properly restored
- [ ] Tests pass in CI/CD pipeline
- [ ] Coverage meets minimum thresholds
- [ ] Documentation updated

---

**Happy Testing!** ??

For questions or issues, see `docs/testing/TESTING_PLAN.md` or open a GitHub issue.

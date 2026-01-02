# ?? Test Directory

This directory contains all automated tests for the RealFeygon.com project.

## ?? Directory Structure

```
test/
??? setup.js                     # Global test configuration
??? mocha.opts                   # Mocha configuration file
??? unit/                        # Unit tests
?   ??? helpers.test.js          # Handlebars helper function tests
?   ??? animalsCallbacks.test.js # Animals callback logic tests
??? integration/                 # Integration tests
    ??? animals-api.test.js      # Animals API endpoint tests
```

## ?? Quick Start

### Run all tests:
```bash
npm test
```

### Run specific test suite:
```bash
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
```

### Generate coverage report:
```bash
npm run test:coverage
```

## ?? Test Statistics

**Total Test Files:** 3  
**Total Test Cases:** ~80+

### Coverage by Module:
- **helpers.js:** 100% (all functions)
- **animalsCallbacks.js:** 95%+ (core functions)
- **animals.js (router):** 85%+ (endpoints)

## ?? Testing Philosophy

1. **Unit Tests** - Test individual functions in isolation
2. **Integration Tests** - Test API endpoints and request/response flow
3. **Mocking** - Use Sinon stubs for external dependencies
4. **Coverage** - Aim for 80%+ overall, 100% for critical paths

## ?? Documentation

For detailed testing guide, see: [`docs/testing/TESTING_GUIDE.md`](../docs/testing/TESTING_GUIDE.md)

For testing plan and strategy, see: [`docs/testing/TESTING_PLAN.md`](../docs/testing/TESTING_PLAN.md)

## ? Writing Tests

### Example Unit Test:
```javascript
describe('myFunction()', () => {
    it('should return expected value', () => {
        const result = myFunction('input');
        expect(result).to.equal('expected');
    });
});
```

### Example Integration Test:
```javascript
it('should return 200 on GET /api/endpoint', (done) => {
    request(app)
        .get('/api/endpoint')
        .expect(200, done);
});
```

## ?? Configuration Files

- **setup.js** - Configures Chai, Sinon, and global test helpers
- **mocha.opts** - Mocha configuration (timeout, reporter, etc.)

## ?? Troubleshooting

**Tests timeout?**  
- Increase timeout in `mocha.opts` or use `this.timeout(5000)` in test

**Module not found?**  
- Check relative paths in `require()` statements

**Stubs not working?**  
- Ensure `sinon.restore()` in `afterEach()` block

---

**Last Updated:** 2026-01-02  
**Test Framework:** Mocha + Chai + Sinon  
**Node.js Version:** 10.x compatible

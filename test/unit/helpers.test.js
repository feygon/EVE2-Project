/**
 * Unit Tests for Handlebars Helpers
 * Tests the custom helper functions used in templates
 */

const helpers = require('../../views/helpers/helpers');
const Handlebars = require('handlebars');

describe('Handlebars Helpers', () => {
    
    describe('range(start, end)', () => {
        // Test basic functionality: should generate array [1,2,3] from range(1,3)
        it('should return correct range [1,2,3] for range(1,3)', () => {
            const result = helpers.range(1, 3);
            expect(result).to.deep.equal([1, 2, 3]);
        });

        // Test edge case: undefined start parameter should return empty array (defensive programming)
        it('should return empty array when start is undefined', () => {
            const result = helpers.range(undefined, 3);
            expect(result).to.deep.equal([]);
        });

        // Test edge case: undefined end parameter should return empty array (defensive programming)
        it('should return empty array when end is undefined', () => {
            const result = helpers.range(1, undefined);
            expect(result).to.deep.equal([]);
        });

        // Test invalid range: start > end should return empty array (no negative ranges)
        it('should return empty array for invalid range (start > end)', () => {
            const result = helpers.range(5, 2);
            expect(result).to.deep.equal([]);
        });

        // Test type coercion: string inputs should be parsed to integers before processing
        it('should handle string inputs by parsing to integers', () => {
            const result = helpers.range('1', '3');
            expect(result).to.deep.equal([1, 2, 3]);
        });

        // Test boundary condition: start == end should return single-element array [5]
        it('should return single element array when start equals end', () => {
            const result = helpers.range(5, 5);
            expect(result).to.deep.equal([5]);
        });

        // Test Handlebars integration: verify helper works with {{#each (range 1 3)}} syntax
        it('should work with Handlebars {{#each}}', () => {
            Handlebars.registerHelper('range', helpers.range);
            const template = Handlebars.compile('{{#each (range 1 3)}}{{this}} {{/each}}');
            const output = template({});
            expect(output).to.equal('1 2 3 ');
        });
    });

    describe('compare(lvalue, rvalue, options)', () => {
        let options;

        beforeEach(() => {
            options = {
                fn: () => 'true block',
                inverse: () => 'false block'
            };
        });

        // Test loose equality: 5 == '5' should be true (type coercion allowed)
        it('should correctly compare with == operator', () => {
            const result = helpers.compare(5, '5', '==', options);
            expect(result).to.equal('true block');
        });

        // Test strict equality: 5 === 5 is true, but 5 === '5' is false (no type coercion)
        it('should correctly compare with === operator', () => {
            const result1 = helpers.compare(5, 5, '===', options);
            expect(result1).to.equal('true block');
            
            const result2 = helpers.compare(5, '5', '===', options);
            expect(result2).to.equal('false block');
        });

        // Test inequality: 5 != 3 should be true (not equal check)
        it('should correctly compare with != operator', () => {
            const result = helpers.compare(5, 3, '!=', options);
            expect(result).to.equal('true block');
        });

        // Test less-than: 3 < 5 should be true (numerical comparison)
        it('should correctly compare with < operator', () => {
            const result = helpers.compare(3, 5, '<', options);
            expect(result).to.equal('true block');
        });

        // Test greater-than: 5 > 3 should be true (numerical comparison)
        it('should correctly compare with > operator', () => {
            const result = helpers.compare(5, 3, '>', options);
            expect(result).to.equal('true block');
        });

        // Test less-than-or-equal: 5 <= 5 should be true (boundary test)
        it('should correctly compare with <= operator', () => {
            const result = helpers.compare(5, 5, '<=', options);
            expect(result).to.equal('true block');
        });

        // Test greater-than-or-equal: 5 >= 5 should be true (boundary test)
        it('should correctly compare with >= operator', () => {
            const result = helpers.compare(5, 5, '>=', options);
            expect(result).to.equal('true block');
        });

        // Test typeof operator: typeof 'test' === 'string' should be true (type checking)
        it('should correctly compare with typeof operator', () => {
            const result = helpers.compare('test', 'string', 'typeof', options);
            expect(result).to.equal('true block');
        });

        // Test error handling: missing required arguments should throw error (validation)
        it('should throw error when less than 3 arguments', () => {
            expect(() => helpers.compare(5, 3)).to.throw();
        });

        // Test error handling: invalid operator should throw descriptive error message
        it('should throw error for invalid operator', () => {
            expect(() => helpers.compare(5, 3, 'invalid', options)).to.throw(/Handlerbars Helper 'compare' doesn't know the operator/);
        });
    });

    describe('eq(lvalue, rvalue)', () => {
        // Test strict equality: values of same type and value should return true
        it('should return true for strict equality', () => {
            expect(helpers.eq(5, 5)).to.be.true;
            expect(helpers.eq('test', 'test')).to.be.true;
        });

        // Test strict inequality: different types (5 vs '5') should return false (uses ===)
        it('should return false for non-equal values', () => {
            expect(helpers.eq(5, '5')).to.be.false;
            expect(helpers.eq(5, 3)).to.be.false;
        });

        // Test null vs undefined: these are different types, should return false
        it('should return false for null vs undefined', () => {
            expect(helpers.eq(null, undefined)).to.be.false;
        });
    });

    describe('or(...args)', () => {
        // Test logical OR: at least one truthy value should return true
        it('should return true if any argument is truthy', () => {
            expect(helpers.or(false, true, false)).to.be.true;
            expect(helpers.or(0, 'string', null)).to.be.true;
        });

        // Test all falsy: all falsy values should return false (false, 0, null, undefined, '')
        it('should return false if all arguments are falsy', () => {
            expect(helpers.or(false, 0, null, undefined, '')).to.be.false;
        });

        // Test Handlebars compatibility: last argument is options object, should be ignored
        it('should ignore options object (last argument)', () => {
            const options = { fn: () => {}, inverse: () => {} };
            expect(helpers.or(false, 0, options)).to.be.false;
        });
    });

    describe('json(context)', () => {
        // Test basic serialization: JavaScript object should convert to JSON string
        it('should correctly stringify JavaScript objects', () => {
            const obj = { name: 'test', value: 42 };
            const result = helpers.json(obj);
            expect(result).to.equal('{"name":"test","value":42}');
        });

        // Test null handling: null should serialize as "null" string
        it('should handle null', () => {
            const result = helpers.json(null);
            expect(result).to.equal('null');
        });

        // Test undefined handling: undefined should return "undefined" string (not valid JSON)
        it('should handle undefined', () => {
            const result = helpers.json(undefined);
            expect(result).to.equal('undefined');
        });

        // Test nested objects: deeply nested structures should serialize correctly
        it('should handle nested objects', () => {
            const obj = { 
                outer: { 
                    inner: { 
                        value: 'nested' 
                    } 
                } 
            };
            const result = helpers.json(obj);
            const parsed = JSON.parse(result);
            expect(parsed.outer.inner.value).to.equal('nested');
        });

        // Test array serialization: arrays should convert to JSON array format
        it('should handle arrays', () => {
            const arr = [1, 2, 3];
            const result = helpers.json(arr);
            expect(result).to.equal('[1,2,3]');
        });
    });

    describe('and(var1, var2, options)', () => {
        let options;

        beforeEach(() => {
            options = {
                fn: () => 'true block',
                inverse: () => 'false block'
            };
        });

        // Test logical AND: all truthy values should return true
        it('should return true only if all arguments are truthy', () => {
            const result = helpers.and(true, 'string', 1, options);
            expect(result).to.equal('true block');
        });

        // Test short-circuit: any falsy value should return false immediately
        it('should return false if any argument is falsy', () => {
            const result = helpers.and(true, false, true, options);
            expect(result).to.equal('false block');
        });

        // Test error handling: no arguments (only options) should throw error
        it('should throw error when called without arguments', () => {
            expect(() => helpers.and(options)).to.throw(/All arguments were false/);
        });
    });

    describe('compare2same(lvalue1, rvalue1, lvalue2, rvalue2, options)', () => {
        let options;

        beforeEach(() => {
            options = {
                fn: () => 'true block',
                inverse: () => 'false block',
                hash: { operator: '==' }
            };
        });

        // Test dual comparison: both comparisons with same operator (5==5 AND 3==3)
        it('should perform two comparisons with same operator', () => {
            const result = helpers.compare2same(5, 5, 3, 3, options);
            expect(result).to.equal('true block');
        });

        // Test short-circuit: first comparison fails, should return false immediately
        it('should return false if first comparison fails', () => {
            const result = helpers.compare2same(5, 3, 3, 3, options);
            expect(result).to.equal('false block');
        });

        // Test second comparison: first passes but second fails, should return false
        it('should return false if second comparison fails', () => {
            const result = helpers.compare2same(5, 5, 3, 4, options);
            expect(result).to.equal('false block');
        });

        // Test strict equality: both comparisons must pass with === operator
        it('should return true only if both comparisons are true', () => {
            options.hash.operator = '===';
            const result = helpers.compare2same('5', '5', 3, 3, options);
            expect(result).to.equal('true block');
        });
    });

    describe('compare2customString(...args)', () => {
        let options;

        beforeEach(() => {
            options = {
                fn: () => 'true block',
                inverse: () => 'false block'
            };
        });

        // Test dual comparison with different operators: (5==5) AND (3<5)
        it('should use different operators for each comparison', () => {
            // lvalue1, rvalue1, operator1, lvalue2, rvalue2, operator2, options
            const result = helpers.compare2customString(5, 5, '==', 3, 5, '<', options);
            expect(result).to.equal('true block');
        });

        // Test first comparison fails: (5==3) is false, short-circuit to false
        it('should return false if first comparison fails', () => {
            const result = helpers.compare2customString(5, 3, '==', 3, 5, '<', options);
            expect(result).to.equal('false block');
        });

        // Test second comparison fails: (5==5) passes but (5<3) fails
        it('should return false if second comparison fails', () => {
            const result = helpers.compare2customString(5, 5, '==', 5, 3, '<', options);
            expect(result).to.equal('false block');
        });

        // Test complex operators: (5===5) AND (3!=5) with extra argument
        it('should handle all valid operator combinations', () => {
            const result = helpers.compare2customString(5, 5, '===', 3, 3, '!=', { value: 5 }, options);
            expect(result).to.equal('true block');
        });
    });
});

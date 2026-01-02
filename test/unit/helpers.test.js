/**
 * Unit Tests for Handlebars Helpers
 * Tests the custom helper functions used in templates
 */

const helpers = require('../../views/helpers/helpers');
const Handlebars = require('handlebars');

describe('Handlebars Helpers', () => {
    
    describe('range(start, end)', () => {
        it('should return correct range [1,2,3] for range(1,3)', () => {
            const result = helpers.range(1, 3);
            expect(result).to.deep.equal([1, 2, 3]);
        });

        it('should return empty array when start is undefined', () => {
            const result = helpers.range(undefined, 3);
            expect(result).to.deep.equal([]);
        });

        it('should return empty array when end is undefined', () => {
            const result = helpers.range(1, undefined);
            expect(result).to.deep.equal([]);
        });

        it('should return empty array for invalid range (start > end)', () => {
            const result = helpers.range(5, 2);
            expect(result).to.deep.equal([]);
        });

        it('should handle string inputs by parsing to integers', () => {
            const result = helpers.range('1', '3');
            expect(result).to.deep.equal([1, 2, 3]);
        });

        it('should return single element array when start equals end', () => {
            const result = helpers.range(5, 5);
            expect(result).to.deep.equal([5]);
        });

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

        it('should correctly compare with == operator', () => {
            const result = helpers.compare(5, '5', '==', options);
            expect(result).to.equal('true block');
        });

        it('should correctly compare with === operator', () => {
            const result1 = helpers.compare(5, 5, '===', options);
            expect(result1).to.equal('true block');
            
            const result2 = helpers.compare(5, '5', '===', options);
            expect(result2).to.equal('false block');
        });

        it('should correctly compare with != operator', () => {
            const result = helpers.compare(5, 3, '!=', options);
            expect(result).to.equal('true block');
        });

        it('should correctly compare with < operator', () => {
            const result = helpers.compare(3, 5, '<', options);
            expect(result).to.equal('true block');
        });

        it('should correctly compare with > operator', () => {
            const result = helpers.compare(5, 3, '>', options);
            expect(result).to.equal('true block');
        });

        it('should correctly compare with <= operator', () => {
            const result = helpers.compare(5, 5, '<=', options);
            expect(result).to.equal('true block');
        });

        it('should correctly compare with >= operator', () => {
            const result = helpers.compare(5, 5, '>=', options);
            expect(result).to.equal('true block');
        });

        it('should correctly compare with typeof operator', () => {
            const result = helpers.compare('test', 'string', 'typeof', options);
            expect(result).to.equal('true block');
        });

        it('should throw error when less than 3 arguments', () => {
            expect(() => helpers.compare(5, 3)).to.throw();
        });

        it('should throw error for invalid operator', () => {
            expect(() => helpers.compare(5, 3, 'invalid', options)).to.throw(/Handlerbars Helper 'compare' doesn't know the operator/);
        });
    });

    describe('eq(lvalue, rvalue)', () => {
        it('should return true for strict equality', () => {
            expect(helpers.eq(5, 5)).to.be.true;
            expect(helpers.eq('test', 'test')).to.be.true;
        });

        it('should return false for non-equal values', () => {
            expect(helpers.eq(5, '5')).to.be.false;
            expect(helpers.eq(5, 3)).to.be.false;
        });

        it('should return false for null vs undefined', () => {
            expect(helpers.eq(null, undefined)).to.be.false;
        });
    });

    describe('or(...args)', () => {
        it('should return true if any argument is truthy', () => {
            expect(helpers.or(false, true, false)).to.be.true;
            expect(helpers.or(0, 'string', null)).to.be.true;
        });

        it('should return false if all arguments are falsy', () => {
            expect(helpers.or(false, 0, null, undefined, '')).to.be.false;
        });

        it('should ignore options object (last argument)', () => {
            const options = { fn: () => {}, inverse: () => {} };
            expect(helpers.or(false, 0, options)).to.be.false;
        });
    });

    describe('json(context)', () => {
        it('should correctly stringify JavaScript objects', () => {
            const obj = { name: 'test', value: 42 };
            const result = helpers.json(obj);
            expect(result).to.equal('{"name":"test","value":42}');
        });

        it('should handle null', () => {
            const result = helpers.json(null);
            expect(result).to.equal('null');
        });

        it('should handle undefined', () => {
            const result = helpers.json(undefined);
            expect(result).to.equal('undefined');
        });

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

        it('should return true only if all arguments are truthy', () => {
            const result = helpers.and(true, 'string', 1, options);
            expect(result).to.equal('true block');
        });

        it('should return false if any argument is falsy', () => {
            const result = helpers.and(true, false, true, options);
            expect(result).to.equal('false block');
        });

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

        it('should perform two comparisons with same operator', () => {
            const result = helpers.compare2same(5, 5, 3, 3, options);
            expect(result).to.equal('true block');
        });

        it('should return false if first comparison fails', () => {
            const result = helpers.compare2same(5, 3, 3, 3, options);
            expect(result).to.equal('false block');
        });

        it('should return false if second comparison fails', () => {
            const result = helpers.compare2same(5, 5, 3, 4, options);
            expect(result).to.equal('false block');
        });

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

        it('should use different operators for each comparison', () => {
            // lvalue1, rvalue1, operator1, lvalue2, rvalue2, operator2, options
            const result = helpers.compare2customString(5, 5, '==', 3, 5, '<', options);
            expect(result).to.equal('true block');
        });

        it('should return false if first comparison fails', () => {
            const result = helpers.compare2customString(5, 3, '==', 3, 5, '<', options);
            expect(result).to.equal('false block');
        });

        it('should return false if second comparison fails', () => {
            const result = helpers.compare2customString(5, 5, '==', 5, 3, '<', options);
            expect(result).to.equal('false block');
        });

        it('should handle all valid operator combinations', () => {
            const result = helpers.compare2customString(5, 5, '===', 3, 3, '!=', { value: 5 }, options);
            expect(result).to.equal('true block');
        });
    });
});

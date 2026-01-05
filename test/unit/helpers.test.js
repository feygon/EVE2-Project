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
                inverse: () => 'false block',
                hash: {}  // Added hash object
            };
        });

        // Test loose equality: 5 == '5' should be true (type coercion allowed)
        it('should correctly compare with == operator', () => {
            options.hash.operator = '==';
            const result = helpers.compare(5, '5', options);
            expect(result).to.equal('true block');
        });

        // Test strict equality: 5 === 5 is true, but 5 === '5' is false (no type coercion)
        it('should correctly compare with === operator', () => {
            options.hash.operator = '===';
            const result1 = helpers.compare(5, 5, options);
            expect(result1).to.equal('true block');
            
            const result2 = helpers.compare(5, '5', options);
            expect(result2).to.equal('false block');
        });

        // Test inequality: 5 != 3 should be true (not equal check)
        it('should correctly compare with != operator', () => {
            options.hash.operator = '!=';
            const result = helpers.compare(5, 3, options);
            expect(result).to.equal('true block');
        });

        // Test less-than: 3 < 5 should be true (numerical comparison)
        it('should correctly compare with < operator', () => {
            options.hash.operator = '<';
            const result = helpers.compare(3, 5, options);
            expect(result).to.equal('true block');
        });

        // Test greater-than: 5 > 3 should be true (numerical comparison)
        it('should correctly compare with > operator', () => {
            options.hash.operator = '>';
            const result = helpers.compare(5, 3, options);
            expect(result).to.equal('true block');
        });

        // Test less-than-or-equal: 5 <= 5 should be true (boundary test)
        it('should correctly compare with <= operator', () => {
            options.hash.operator = '<=';
            const result = helpers.compare(5, 5, options);
            expect(result).to.equal('true block');
        });

        // Test greater-than-or-equal: 5 >= 5 should be true (boundary test)
        it('should correctly compare with >= operator', () => {
            options.hash.operator = '>=';
            const result = helpers.compare(5, 5, options);
            expect(result).to.equal('true block');
        });

        // Test typeof operator: typeof 'test' === 'string' should be true (type checking)
        it('should correctly compare with typeof operator', () => {
            options.hash.operator = 'typeof';
            const result = helpers.compare('test', 'string', options);
            expect(result).to.equal('true block');
        });

        // Test error handling: missing required arguments should throw error (validation)
        it('should throw error when less than 3 arguments', () => {
            expect(() => helpers.compare(5, undefined)).to.throw();
        });

        // Test error handling: invalid operator should throw descriptive error message
        it('should throw error for invalid operator', () => {
            options.hash.operator = 'invalid';
            expect(() => helpers.compare(5, 3, options)).to.throw(/Handlebars Helper 'comparison' doesn't know the operator/);
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

        // Test undefined handling: JSON.stringify(undefined) returns undefined (not a string)
        it('should handle undefined', () => {
            const result = helpers.json(undefined);
            expect(result).to.be.undefined;
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
                inverse: () => 'false block',
                hash: {}
            };
        });

        // Test dual comparison with different operators: (5==5) AND (3<5)
        it('should use different operators for each comparison', () => {
            // lvalue1, rvalue1, lvalue2, rvalue2, operator_2ndSet, options
            options.hash.operator = '==';
            const result = helpers.compare2customString(5, 5, 3, 5, '<', options);
            expect(result).to.equal('true block');
        });

        // Test first comparison fails: (5==3) is false, short-circuit to false
        it('should return false if first comparison fails', () => {
            options.hash.operator = '==';
            const result = helpers.compare2customString(5, 3, 3, 5, '<', options);
            expect(result).to.equal('false block');
        });

        // Test second comparison fails: (5==5) passes but (5<3) fails
        it('should return false if second comparison fails', () => {
            options.hash.operator = '==';
            const result = helpers.compare2customString(5, 5, 5, 3, '<', options);
            expect(result).to.equal('false block');
        });

        // Test complex operators: (5===5) AND (3!=5)
        it('should handle all valid operator combinations', () => {
            options.hash.operator = '===';
            const result = helpers.compare2customString(5, 5, 3, 5, '!=', options);
            expect(result).to.equal('true block');
        });
    });

    describe('formatGreen(spell, categoryName)', () => {
        // Test rank transformations (Cantrip, 1st, 2nd, 3rd, 4th+)
        it('should format rank 0 as "Cantrip"', () => {
            const spell = { spell_rank: 0 };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('Cantrip');
        });

        it('should format rank 1 as "1st"', () => {
            const spell = { spell_rank: 1 };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('1st');
        });

        it('should format rank 2 as "2nd"', () => {
            const spell = { spell_rank: 2 };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('2nd');
        });

        it('should format rank 3 as "3rd"', () => {
            const spell = { spell_rank: 3 };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('3rd');
        });

        it('should format rank 4+ with "th" suffix', () => {
            const spell = { spell_rank: 5 };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('5th');
        });

        it('should format rank 6 with "th" suffix', () => {
            const spell = { spell_rank: 6 };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('6th');
        });

        it('should format rank 7 with "th" suffix', () => {
            const spell = { spell_rank: 7 };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('7th');
        });

        // Test rarity
        it('should include rarity when present', () => {
            const spell = { spell_rank: 1, rarity: 'Uncommon' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('1st, Uncommon');
        });

        it('should include Common rarity', () => {
            const spell = { spell_rank: 2, rarity: 'Common' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('2nd, Common');
        });

        it('should include Rare rarity', () => {
            const spell = { spell_rank: 4, rarity: 'Rare' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('4th, Rare');
        });

        // Test area formatting (based on real spell data)
        it('should format area "30-foot emanation" with feet -> ft.', () => {
            const spell = { spell_rank: 6, area: '30-foot emanation' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('6th, AoE 30-ft. emanation');
        });

        it('should format area "30-ft. burst" with 30-ft. -> 30\'', () => {
            const spell = { spell_rank: 5, area: '30-ft. burst' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('5th, AoE 30\' burst');
        });

        it('should format area "15-foot cone"', () => {
            const spell = { spell_rank: 1, area: '15-foot cone' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('1st, AoE 15-ft. cone');
        });

        it('should format area "10-foot burst"', () => {
            const spell = { spell_rank: 2, area: '10-foot burst' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('2nd, AoE 10-ft. burst');
        });

        it('should skip area when not present', () => {
            const spell = { spell_rank: 1 };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('1st');
        });

        // Test range formatting (based on real spell data)
        it('should format range "touch" as "Touch"', () => {
            const spell = { spell_rank: 2, spell_range: 'touch' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('2nd, Touch');
        });

        it('should format range "30 feet" with feet -> apostrophe', () => {
            const spell = { spell_rank: 1, spell_range: '30 feet' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('1st, Range: 30\'');
        });

        it('should format range "60 feet"', () => {
            const spell = { spell_rank: 2, spell_range: '60 feet' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('2nd, Range: 60\'');
        });

        it('should format range "120 feet"', () => {
            const spell = { spell_rank: 4, spell_range: '120 feet' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('4th, Range: 120\'');
        });

        it('should format range "500 feet"', () => {
            const spell = { spell_rank: 5, spell_range: '500 feet' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('5th, Range: 500\'');
        });

        it('should format range "planetary"', () => {
            const spell = { spell_rank: 4, spell_range: 'planetary' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('4th, Range: planetary');
        });

        it('should skip range when not present', () => {
            const spell = { spell_rank: 1 };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('1st');
        });

        // Test duration - long duration (hours, days, daily preparations)
        it('should classify "until your next daily preparations" as long duration', () => {
            const spell = { spell_rank: 1, duration_raw: 'until your next daily preparations' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('1st, long duration');
        });

        it('should classify "1 hour" as long duration', () => {
            const spell = { spell_rank: 2, duration_raw: '1 hour' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('2nd, long duration');
        });

        it('should classify "8 hours" as long duration', () => {
            const spell = { spell_rank: 2, duration_raw: '8 hours' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('2nd, long duration');
        });

        it('should classify "1 day" as long duration', () => {
            const spell = { spell_rank: 4, duration_raw: '1 day' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('4th, long duration');
        });

        it('should classify "until daily preparations" as long duration', () => {
            const spell = { spell_rank: 5, duration_raw: 'until daily preparations' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('5th, long duration');
        });

        it('should classify "unlimited" as long duration', () => {
            const spell = { spell_rank: 3, duration_raw: 'unlimited' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('3rd, long duration');
        });

        // Test duration - short duration (minutes, rounds, sustained)
        it('should classify "1 minute" as short duration', () => {
            const spell = { spell_rank: 2, duration_raw: '1 minute' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('2nd, short duration');
        });

        it('should classify "10 minutes" as short duration', () => {
            const spell = { spell_rank: 1, duration_raw: '10 minutes' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('1st, short duration');
        });

        it('should classify "sustained up to 1 minute" as short duration', () => {
            const spell = { spell_rank: 6, duration_raw: 'sustained up to 1 minute' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('6th, short duration');
        });

        it('should classify "sustained up to 10 minutes" as long duration', () => {
            const spell = { spell_rank: 3, duration_raw: 'sustained up to 10 minutes' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('3rd, long duration');
        });

        it('should classify "sustained up to 4 rounds" as short duration', () => {
            const spell = { spell_rank: 2, duration_raw: 'sustained up to 4 rounds' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('2nd, short duration');
        });

        it('should classify "sustained" alone as long duration (defaults to 10 min)', () => {
            const spell = { spell_rank: 0, duration_raw: 'sustained' };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('Cantrip, long duration');
        });

        it('should skip duration when not present', () => {
            const spell = { spell_rank: 1 };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('1st');
        });

        // Test damaging rule (only for Category 2)
        it('should add "damaging" for Category 2: Damage Spells', () => {
            const spell = { spell_rank: 1 };
            const result = helpers.formatGreen(spell, '2. Damage Spells');
            expect(result).to.equal('1st, damaging');
        });

        it('should NOT add "damaging" for other categories', () => {
            const spell = { spell_rank: 1 };
            const result = helpers.formatGreen(spell, '1. Buff Spells');
            expect(result).to.equal('1st');
        });

        it('should NOT add "damaging" when category is undefined', () => {
            const spell = { spell_rank: 1 };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('1st');
        });

        // Test real spell examples from CSV
        it('should format "Blur" spell correctly', () => {
            // Blur: rank 2, no rarity in output, touch range, 1 minute duration
            const spell = { 
                spell_rank: 2, 
                spell_range: 'touch', 
                duration_raw: '1 minute' 
            };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('2nd, Touch, short duration');
        });

        it('should format "Invisibility" spell correctly', () => {
            // Invisibility: rank 2, touch, 10 minutes
            const spell = { 
                spell_rank: 2, 
                spell_range: 'touch', 
                duration_raw: '10 minutes' 
            };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('2nd, Touch, short duration');
        });

        it('should format "Illusory Scene" spell correctly', () => {
            // Illusory Scene: rank 5, 500 feet range, 30-foot burst, 1 hour
            const spell = { 
                spell_rank: 5, 
                spell_range: '500 feet', 
                area: '30-foot burst', 
                duration_raw: '1 hour' 
            };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('5th, AoE 30-ft. burst, Range: 500\', long duration');
        });

        it('should format "Nightmare" spell correctly', () => {
            // Nightmare: rank 4, planetary range, 1 day duration
            const spell = { 
                spell_rank: 4, 
                spell_range: 'planetary', 
                duration_raw: '1 day' 
            };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('4th, Range: planetary, long duration');
        });

        it('should format "Figment" cantrip correctly', () => {
            // Figment: rank 0, 30 feet, sustained (defaults to 10 min = long duration)
            const spell = { 
                spell_rank: 0, 
                spell_range: '30 feet', 
                duration_raw: 'sustained' 
            };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('Cantrip, Range: 30\', long duration');
        });

        it('should format "Aura of the Unremarkable" correctly', () => {
            // Rank 6, Uncommon, 30-foot emanation, sustained up to 1 minute
            const spell = { 
                spell_rank: 6, 
                rarity: 'Uncommon', 
                area: '30-foot emanation', 
                duration_raw: 'sustained up to 1 minute' 
            };
            const result = helpers.formatGreen(spell);
            expect(result).to.equal('6th, Uncommon, AoE 30-ft. emanation, short duration');
        });

        // Test complex spell with all attributes
        it('should handle spell with all attributes combined', () => {
            const spell = {
                spell_rank: 3,
                rarity: 'Rare',
                area: '30-ft. burst',
                spell_range: '60 feet',
                duration_raw: '1 minute'
            };
            const result = helpers.formatGreen(spell, '2. Damage Spells');
            expect(result).to.equal('3rd, Rare, AoE 30\' burst, Range: 60\', short duration, damaging');
        });
    });
});

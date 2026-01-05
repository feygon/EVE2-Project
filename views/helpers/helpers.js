/*
*   Based on Boilerplate code provided by DogintheHat
*   https://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/
*   Accessed 11/23/2018, 9:56pm
*/

exports.compare = function(lvalue, rvalue, options) {
    console.log("starting comparison");
    
    if (arguments.length < 3){
        throw new Error("Handlebars Helper 'comparison' needs 2 parameters");
    }
    /* istanbul ignore next */
    var operator = options.hash.operator || "==";
    /* istanbul ignore next */
    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    }

    if (!operators[operator]) {
        /* istanbul ignore next */
        throw new Error("Handlebars Helper 'comparison' doesn't know the operator " + operator);
    }

    console.log(" of " + lvalue + " " + operator + " " + rvalue);
    // arrayed inputs must always use the same comparison operator.
    
    var result = operators[(operator)](lvalue,rvalue);
    
    console.log("returning result " + result);
    if(result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
};

exports.compare2same = function(lvalue1, rvalue1, lvalue2, rvalue2, options) {
    /* istanbul ignore if */
    if (arguments.length < 5){
        throw new Error("Handlebars Helper dual 'comparison' needs 4 parameters");
    }

    /* istanbul ignore next */
    var operator = options.hash.operator || "==";

    /* istanbul ignore next */
    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    }

    /* istanbul ignore if */
    if (!operators[operator]) {
        throw new Error("Handlebars Helper 'comparison' doesn't know the operator " + operator);
    }

    // arrayed inputs must always use the same comparison operator.
    var result1 = operators[(operator)](lvalue1, rvalue1);
    var result2 = result1 && (operators[(operator)](lvalue2, rvalue2));

    if(result2) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
};

exports.compare2customString = function(lvalue1, rvalue1, lvalue2, rvalue2, operator_2ndSet, options) {

    /* istanbul ignore next */
    if (arguments.length < 5) {
        throw new Error("Handlebars Helper dual 'comparison' needs 4 parameters");
    }

    /* istanbul ignore next */
    var operator = options.hash.operator || "==";

    /* istanbul ignore next */
    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    }

    /* istanbul ignore next */
    if (!operators[operator]) {
        throw new Error("Handlebars Helper 'comparison' doesn't know the operator " + operator);
    }

    // arrayed inputs must always use the same comparison operator.
    var result1 = operators[operator](lvalue1, rvalue1);

    var result2 = result1 && (operators[operator_2ndSet](lvalue2, rvalue2));

    if(result2) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
};

// Handle illusion page methods
exports.formatGreen = function (spell, categoryName) {
    var parts = [];

    // 1. Rank Transformation (0 -> Cantrip, 1 -> 1st, etc.)
    var rank = spell.spell_rank === 0 ? "Cantrip" :
        spell.spell_rank === 1 ? "1st" :
            spell.spell_rank === 2 ? "2nd" :
                spell.spell_rank === 3 ? "3rd" :
                    spell.spell_rank + "th";
    parts.push(rank);

    // 2. Rarity
    if (spell.rarity) { parts.push(spell.rarity); }

    // 3. Area (Formatting shorthand: feet -> ft. and 30-ft. -> 30')
    if (spell.area) {
        // First, check if area already contains "30-ft." (written that way in source)
        // If so, replace it with "30'" for brevity
        // Otherwise, just replace "foot/feet" with "ft."
        var areaFormatted = spell.area;
        if (areaFormatted.includes('30-ft.')) {
            areaFormatted = areaFormatted.replace('30-ft.', "30'");
        } else {
            areaFormatted = areaFormatted.replace(/foot|feet/g, 'ft.');
        }
        parts.push("AoE " + areaFormatted);
    }

    // 4. Range (Formatting shorthand: feet -> ')
    if (spell.spell_range) {
        var r = spell.spell_range.toLowerCase();
        var rangeText = r.includes('touch') ? 'Touch' : 'Range: ' + spell.spell_range.replace(/ feet| foot/g, "'");
        parts.push(rangeText);
    }

    // 5. Duration logic (Classifying length)
    if (spell.duration_raw) {
        var d = spell.duration_raw.toLowerCase();
        
        // Check for long duration first (daily, hour, day, unlimited)
        if (d.includes('daily') || d.includes('hour') || d.includes('day') || d.includes('unlimited')) {
            parts.push('long duration');
        }
        // Check for "sustained" - only short if explicitly less than 10 minutes
        else if (d.includes('sustained')) {
            // "sustained" alone or "sustained up to 10 minutes" = long duration (default 10 min)
            // "sustained up to X minute" where X < 10, or "sustained up to X round" = short duration
            if ((d.includes('minute') && !d.includes('10 minute')) || d.includes('round')) {
                parts.push('short duration');
            } else {
                parts.push('long duration');
            }
        }
        // Check for other short durations (minutes, rounds - but not if already handled by sustained)
        /* istanbul ignore else */
        else {
            /* istanbul ignore next */
            if (d.includes('minute') || d.includes('round')) {
                parts.push('short duration');
            }
        }
    }

    // 6. The "Damaging" Rule (Only if rendered in Category 2)
    if (categoryName === "2. Damage Spells") {
        parts.push('damaging');
    }

    return parts.filter(Boolean).join(', ');
};

exports.eq = function(lvalue, rvalue) {
    return lvalue === rvalue;
};

// Generate a range of numbers for iteration
exports.range = function(start, end) {
    // Handle if called as inline helper (no options parameter)
    // or as block helper (with options parameter)
    if (typeof start === 'undefined' || typeof end === 'undefined') {
        return [];
    }
    
    const result = [];
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);
    
    for (let i = startNum; i <= endNum; i++) {
        result.push(i);
    }
    return result;
};

// Check if value exists (for conditional rendering)
exports.or = function(...args) {
    // Remove the options object (last argument)
    const options = args.pop();
    return args.some(arg => !!arg);
};

// JSON stringify helper for passing data to JavaScript
exports.json = function(context) {
    return JSON.stringify(context);
};
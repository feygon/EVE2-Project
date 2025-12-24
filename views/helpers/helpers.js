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

    var operator = options.hash.operator || "==";

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
        // reachable?
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

exports.and = function(var1, var2, options) {
    var ct = arguments.length;
    if (ct < 1) {throw new Error("AND function without objects to compare");}
    var truthy = true;
    var i; for (i=0; i<ct; i++) {
        if (arguments[i] == false) {truthy = false;}
    }
    if (truthy) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
};

exports.compare2same = function(lvalue1, rvalue1, lvalue2, rvalue2, options) {

    if (arguments.length < 5){
        throw new Error("Handlebars Helper dual 'comparison' needs 4 parameters");
    }

    var operator = options.hash.operator || "==";

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
        throw new Error("Handlebars Helper 'comparison' doesn't know the operator " + operator1);
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

    if (arguments.length < 5){
        throw new Error("Handlebars Helper dual 'comparison' needs 4 parameters");
    }

    var operator = options.hash.operator || "==";

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
        throw new Error("Handlebars Helper 'comparison' doesn't know the operator " + operator1);
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

exports.multiply = function(lvalue, rvalue){
    if(arguments.length != 3){
        throw new Error("Handlebars Helper ' multiply' needs 2 parameters.");
    }
    if (!isNumber(lvalue)) {
        throw new TypeError('expected lvalue to be a number');
      }
      if (!isNumber(rvalue)) {
        throw new TypeError('expected rvalue to be a number');
      }
    return template(lvalue * rvalue);
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
        var areaFormatted = spell.area.replace(/foot|feet/g, 'ft.').replace('30-ft.', "30'");
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
        if (d.includes('daily') || d.includes('hour') || d.includes('day')) {
            parts.push('long duration');
        } else if (d.includes('minute') || d.includes('round') || d.includes('sustained')) {
            parts.push('short duration');
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
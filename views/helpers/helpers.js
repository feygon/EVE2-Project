/*
*   Based on Boilerplate code provided by DogintheHat
*   https://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/
*   Accessed 11/23/2018, 9:56pm
*/

exports.compare = function(lvalue, rvalue, options) {

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
        throw new Error("Handlebars Helper 'comparison' doesn't know the operator " + operator);
    }

    // arrayed inputs must always use the same comparison operator.
    
    var result = operators[(operator)](lvalue,rvalue);
    

    if(result) {
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

exports.compare2customString = function(lvalue1, rvalue1, lvalue2, rvalue2, customString, options) {

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

    var result2 = result1 && (operators[customString](lvalue2, rvalue2));

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
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
    // Remove the Handlebars options object (last argument)
    const options = args.pop();
    // Return the first truthy value, or the last value as fallback
    for (const arg of args) {
        if (arg) return arg;
    }
    return args[args.length - 1];
};

// JSON stringify helper for passing data to JavaScript
exports.json = function(context) {
    return JSON.stringify(context);
};

// JSON for HTML data attributes (HTML-entity-escaped)
exports.jsonEscape = function(context) {
    return JSON.stringify(context).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

// Format number rounded to nearest $1k, displayed with 'k' suffix (e.g., 95000 -> 95k, 1235000 -> 1,235k)
// Actual values preserved in tooltips; this is display-only rounding
exports.formatNumber = function(num) {
    if (typeof num === 'undefined' || num === null) return '0';
    var k = Math.round(num / 1000);
    if (k === 0 && num !== 0) return Math.round(num).toLocaleString('en-US');
    return k.toLocaleString('en-US') + 'k';
};

// Format number in k with 1 decimal place (e.g., $5.2k, -$3.1k)
exports.formatNumber1d = function(num) {
    if (typeof num === 'undefined' || num === null) return '0';
    var k = num / 1000;
    if (Math.abs(k) < 0.1 && num !== 0) return Math.round(num).toLocaleString('en-US');
    return k.toFixed(1) + 'k';
};

// Format number with exact precision (for tooltips and detail views)
exports.formatNumberExact = function(num) {
    if (typeof num === 'undefined' || num === null) return '0';
    return Math.round(num).toLocaleString('en-US');
};

// Format large asset values: 3 significant digits with M suffix if >= $1M, otherwise k
exports.formatAssets = function(num) {
    if (typeof num === 'undefined' || num === null) return '0';
    if (Math.abs(num) >= 1000000) {
        var m = num / 1000000;
        return m.toFixed(2) + 'M';
    }
    var k = Math.round(num / 1000);
    if (k === 0) return '0';
    return k.toLocaleString('en-US') + 'k';
};

// Format breakdown object into tooltip string (e.g., "SS: $27,000\nSMA: $5,000\nRental: $21,000")
exports.formatBreakdown = function(obj) {
    if (!obj || typeof obj !== 'object') return '';

    const items = [];
    for (const [key, value] of Object.entries(obj)) {
        // Skip 'total' field
        if (key === 'total') continue;

        // Format key (capitalize, replace underscores)
        const label = key.replace(/_/g, ' ')
                         .split(' ')
                         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                         .join(' ');

        // Format value as currency
        const amount = '$' + Math.round(value).toLocaleString('en-US');
        items.push(label + ': ' + amount);
    }

    return items.join('\n');
};

// Count non-total items in breakdown object
exports.countItems = function(obj) {
    if (!obj || typeof obj !== 'object') return 0;

    let count = 0;
    for (const key in obj) {
        if (key !== 'total' && key !== 'lifestyle') count++;
    }

    return count;
};

// Add helper for summing numbers
exports.add = function(...args) {
    // Remove the options object (last argument)
    const options = args.pop();
    return args.reduce((sum, num) => sum + (num || 0), 0);
};

// Subtract helper
exports.subtract = function(a, b) {
    return (a || 0) - (b || 0);
};

// Multiply helper
exports.multiply = function(a, b) {
    return (a || 0) * (b || 0);
};

// Format percentage (decimal to percent string)
exports.formatPercentage = function(decimal) {
    const percent = (decimal || 0) * 100;
    return percent.toFixed(1) + '%';
};

// Format IRA tooltip with comprehensive breakdown
exports.formatIraTooltip = function(projection) {
    if (!projection) return '';

    const formatNum = (num) => Math.round(num || 0).toLocaleString('en-US');

    const growthRate = projection.managed_ira_growth_rate
        ? (projection.managed_ira_growth_rate * 100).toFixed(1) + '%'
        : '4.0%';

    return `IRA Activity:

SDIRA Checking Open: $${formatNum(projection.sdira_checking_open)}
Annuity SMA Payments In: +$${formatNum(projection.annuity_payments)}
  └─ From 7 separate annuity instruments
SDIRA Checking Available: $${formatNum(projection.sdira_checking_available)}
Distributions Out: -$${formatNum(projection.sdira_distributions)}
SDIRA Checking Close: $${formatNum(projection.sdira_checking_close)}

ManagedIRA Open: $${formatNum(projection.managed_ira_open)}
Growth (${growthRate}): +$${formatNum(projection.managed_ira_growth)}
Distributions Out: -$${formatNum(projection.managed_ira_distributions)}
ManagedIRA Close: $${formatNum(projection.managed_ira_close)}
────────────────────────
Total IRA Open: $${formatNum(projection.total_ira_open)}
Total IRA Close: $${formatNum(projection.total_ira_close)}
Total Change: $${formatNum(projection.total_ira_close - projection.total_ira_open)}`;
};

// Format Real Estate tooltip
exports.formatRealEstateTooltip = function(projection) {
    if (!projection) return '';

    const formatNum = (num) => Math.round(num || 0).toLocaleString('en-US');

    let tooltip = `Real Estate:
House (Primary): $${formatNum(projection.house_value)} (+$${formatNum(projection.house_appreciation)})
Condo (Arbor Roses): $${formatNum(projection.condo_value)} (+$${formatNum(projection.condo_appreciation)})`;

    // Add debt information
    if (projection.heloc_balance && projection.heloc_balance > 0) {
        const helocRate = projection.heloc_rate
            ? (projection.heloc_rate * 100).toFixed(2) + '%'
            : '7.50%';
        tooltip += `\nHELOC Balance: -$${formatNum(projection.heloc_balance)} (${helocRate} interest)`;
    }
    if (projection.mortgage_balance && projection.mortgage_balance > 0) {
        if (projection.primary_mortgage_balance > 0 || projection.condo_mortgage_balance > 0) {
            const primaryRate = projection.primary_mortgage_rate
                ? (projection.primary_mortgage_rate * 100).toFixed(1) + '%'
                : '5.7%';
            const condoRate = projection.condo_mortgage_rate
                ? (projection.condo_mortgage_rate * 100).toFixed(1) + '%'
                : '6.5%';
            if (projection.primary_mortgage_balance > 0) {
                tooltip += `\nPrimary Mortgage (IO): -$${formatNum(projection.primary_mortgage_balance)} (${primaryRate})`;
            }
            if (projection.condo_mortgage_balance > 0) {
                tooltip += `\nCondo Mortgage (P&I): -$${formatNum(projection.condo_mortgage_balance)} (${condoRate})`;
            }
        } else {
            tooltip += `\nMortgage Balance: -$${formatNum(projection.mortgage_balance)}`;
        }
    }
    if ((projection.heloc_balance > 0 || projection.mortgage_balance > 0)) {
        const totalDebt = (projection.heloc_balance || 0) + (projection.mortgage_balance || 0);
        const houseValue = projection.house_value || 0;
        const ltv = houseValue > 0 ? (totalDebt / houseValue * 100) : 0;
        tooltip += `\nCombined LTV: ${ltv.toFixed(1)}% (${totalDebt >= houseValue * 0.6 ? '⚠️ TRIGGERS CONDO SALE' : 'OK'})`;
    }

    // Add condo sale notice if applicable
    if (projection.condo_sold) {
        tooltip += `\n\n⚠️ CONDO SOLD THIS YEAR`;
        if (projection.condo_sale_proceeds) {
            tooltip += ` for $${formatNum(projection.condo_sale_proceeds)}`;
        }
        if (projection.heloc_payoff) {
            tooltip += `\n  HELOC paid off: $${formatNum(projection.heloc_payoff)}`;
        }
        if (projection.mortgage_paydown_from_sale) {
            tooltip += `\n  Mortgage paid down: $${formatNum(projection.mortgage_paydown_from_sale)}`;
        }
    }

    tooltip += `\n────────────────────────
Total: $${formatNum(projection.real_estate_total)}
Total Appreciation: +$${formatNum(projection.house_appreciation + projection.condo_appreciation)}`;

    return tooltip;
};

// Format LTC tooltip
exports.formatLtcTooltip = function(projection) {
    if (!projection) return '';

    const formatNum = (num) => Math.round(num || 0).toLocaleString('en-US');

    return `LTC Savings:
Starting Balance: $${formatNum(projection.ltc_savings_open)}
Used This Year: -$${formatNum(projection.ltc_savings_spent)}
────────────────────────
Remaining: $${formatNum(projection.ltc_savings_close)}`;
};

// Format Income tooltip (enhanced with IRA breakdown)
exports.formatIncomeTooltip = function(income, projection) {
    if (!income || typeof income !== 'object') return '';

    const formatNum = (num) => Math.round(num || 0).toLocaleString('en-US');
    const lines = [];

    lines.push('Income Sources:');

    if (income.ssdi) {
        lines.push(`SSDI: $${formatNum(income.ssdi)}`);
    }

    if (income.ira_distributions) {
        lines.push(`IRA Distributions: $${formatNum(income.ira_distributions)}`);
        if (projection) {
            if (projection.sdira_distributions > 0) {
                lines.push(`  └─ From SDIRA Checking: $${formatNum(projection.sdira_distributions)}`);
            }
            if (projection.managed_ira_distributions > 0) {
                lines.push(`  └─ From ManagedIRA: $${formatNum(projection.managed_ira_distributions)}`);
            }
        }
    }

    if (income.ltc_spending) {
        lines.push(`LTC Savings Spending: $${formatNum(income.ltc_spending)}`);
    }

    if (income.ltc_payout) {
        lines.push(`LTC Policy Payout: $${formatNum(income.ltc_payout)}`);
    }

    if (income.sma_payments) {
        lines.push(`SMA Payments: $${formatNum(income.sma_payments)}`);
    }

    // Personal Budget = all income sources EXCEPT rental (which is earmarked)
    const personalBudget = income.total - (income.rental || 0);
    lines.push('────────────────────────');
    lines.push(`Personal Budget: $${formatNum(personalBudget)}`);

    // LTC cash supplement (non-income, tax-free)
    if (income.ltc_spending && income.ltc_spending > 0) {
        lines.push(`Supplemented by $${formatNum(income.ltc_spending)} LTC Cash (non-income)`);
    }

    // MAPT trust income / Rental income
    if (income.rental && income.rental > 0) {
        lines.push('────────────────────────');
        if (projection && projection.rental_to_trust) {
            lines.push('MAPT Trust Income:');
            lines.push(`  Arbor Roses rental: $${formatNum(income.rental)}`);
            if (income.roommate) {
                lines.push(`  Primary house roommate: $${formatNum(income.roommate)}`);
            }
            const trustIncomeTotal = (income.rental || 0) + (income.roommate || 0);
            lines.push(`  Trust income total: $${formatNum(trustIncomeTotal)}`);
            lines.push('');
            lines.push('Flows to MAPT checking — not Person A\'s');
            lines.push('taxable income (reported on Form 1041).');
        } else {
            lines.push(`Rental Income: $${formatNum(income.rental)}`);
            if (income.roommate) {
                lines.push(`Roommate Income: $${formatNum(income.roommate)}`);
            }
            lines.push('');
            lines.push('Note: Rental income is earmarked for');
            lines.push('condo expenses and is ADDITIONAL to');
            lines.push('the lifestyle floor.');
        }
    }

    // Add AGI reference
    if (projection && projection.agi !== undefined) {
        lines.push('');
        lines.push(`AGI (see Income (taxable) column): $${formatNum(projection.agi)}`);
    }

    return lines.join('\n');
};

// Format Taxable Income tooltip - shows income from taxable sources and AGI breakdown
exports.formatTaxableIncomeTooltip = function(projection) {
    if (!projection) return '';

    const formatNum = (num) => Math.round(num || 0).toLocaleString('en-US');
    const lines = [];

    lines.push('Income from Taxable Sources:');
    lines.push('');

    // Social Security — show IRS Pub 915 progressive calculation
    if (projection.income && projection.income.ssdi) {
        const ss = projection.income.ssdi;
        const taxableSS = projection.taxable_ss || 0;
        const provisionalIncome = projection.provisional_income || 0;
        const ssTier = projection.ss_tier || 'tier_0_none';
        const pct = taxableSS > 0 ? (taxableSS / ss * 100).toFixed(1) : '0.0';
        lines.push(`Social Security: $${formatNum(ss)} (${pct}% taxable)`);
        lines.push('');
        lines.push('  SS Taxability (IRS Pub 915):');
        lines.push(`  Provisional Income = other income + 50% SS`);
        lines.push(`    = $${formatNum(provisionalIncome - ss * 0.5)} + $${formatNum(Math.round(ss * 0.5))}`);
        lines.push(`    = $${formatNum(provisionalIncome)}`);
        if (ssTier === 'tier_0_none') {
            lines.push(`  PI < $25,000 → 0% taxable`);
        } else if (ssTier === 'tier_50_percent') {
            const over25k = provisionalIncome - 25000;
            const taxable50 = Math.min(over25k * 0.5, ss * 0.5);
            lines.push(`  $25,000 < PI < $34,000 → 50% tier`);
            lines.push(`  Excess over $25k: $${formatNum(over25k)}`);
            lines.push(`  50% of excess: $${formatNum(Math.round(over25k * 0.5))}`);
            lines.push(`  Taxable SS: $${formatNum(taxableSS)} (capped at 50% of SS)`);
        } else {
            const over25k = 9000; // $34k - $25k
            const tier1 = Math.min(over25k * 0.5, ss * 0.5); // $4,500
            const over34k = provisionalIncome - 34000;
            lines.push(`  PI > $34,000 → 85% tier`);
            lines.push(`  Tier 1: 50% of ($34k-$25k) = $${formatNum(Math.round(tier1))}`);
            lines.push(`  Tier 2: 85% of ($${formatNum(provisionalIncome)}-$34k) = $${formatNum(Math.round(over34k * 0.85))}`);
            lines.push(`  Taxable SS: $${formatNum(taxableSS)} (capped at 85% of SS)`);
        }
        lines.push('');
    }

    // Rental income (only if it's Person A's income, not trust income)
    if (projection.income && projection.income.rental && !projection.rental_to_trust) {
        lines.push(`Rental Income: $${formatNum(projection.income.rental)}`);
    }

    // IRA distributions (including HELOC if drawn)
    const totalIRA = (projection.income && projection.income.ira_distributions) || 0;
    const helocDrawn = projection.heloc_drawn || 0;
    const taxableIRA = totalIRA - helocDrawn;
    if (totalIRA > 0) {
        lines.push(`IRA Distributions: $${formatNum(totalIRA)}`);
        if (helocDrawn > 0) {
            lines.push(`  (includes $${formatNum(helocDrawn)} HELOC — not taxable)`);
        }
    }

    // Total uses actual taxable amounts, not gross
    const taxableSS = projection.taxable_ss || 0;
    const rentalForTax = (!projection.rental_to_trust && projection.income) ? (projection.income.rental || 0) : 0;
    const totalTaxable = taxableSS + rentalForTax + taxableIRA;
    lines.push('────────────────────────');
    lines.push(`Total Taxable Income: $${formatNum(totalTaxable)}`);
    lines.push('');
    lines.push('AGI Breakdown:');
    lines.push('');

    if (projection.income && projection.income.ssdi) {
        lines.push(`SS taxable: $${formatNum(taxableSS)}`);
    }

    if (rentalForTax > 0) {
        lines.push(`Rental: $${formatNum(rentalForTax)}`);
    }

    if (taxableIRA > 0) {
        lines.push(`IRA: $${formatNum(taxableIRA)}`);
    }

    lines.push('────────────────────────');
    lines.push(`AGI: $${formatNum(projection.agi || 0)}`);

    return lines.join('\n');
};

// Format Expenses tooltip - Person A expenses first, then MAPT trust expenses
// projection param is optional — used to detect MAPT scenario
exports.formatExpensesTooltip = function(expenses, projection) {
    if (!expenses || typeof expenses !== 'object') return '';
    if (projection && projection.hash !== undefined) projection = null;

    const formatNum = (num) => Math.round(num || 0).toLocaleString('en-US');
    const lines = [];
    const isMapt = projection && projection.rental_to_trust;
    const inMC = projection && projection.in_memory_care;

    // ═══ PERSON A EXPENSES ═══
    lines.push('Person A Expenses:');
    lines.push('');

    let personATotal = 0;

    // Lifestyle & Giving
    if (expenses.lifestyle || expenses.charitable) {
        lines.push('  Lifestyle & Giving:');
        if (expenses.lifestyle) { lines.push(`    Lifestyle: $${formatNum(expenses.lifestyle)}`); personATotal += expenses.lifestyle; }
        if (expenses.charitable) { lines.push(`    Charitable: $${formatNum(expenses.charitable)}`); personATotal += expenses.charitable; }
    }

    // Primary House (Person A pays while living there, trust pays post-MC in MAPT)
    const primaryPersonA = !isMapt || !inMC;
    if (primaryPersonA) {
        const hasHouse = expenses.primary_house_taxes || expenses.primary_house_utilities || expenses.primary_house_insurance || expenses.primary_house_maintenance;
        if (hasHouse) {
            lines.push('  Primary House:');
            if (expenses.primary_house_taxes) { lines.push(`    Property Tax: $${formatNum(expenses.primary_house_taxes)}`); personATotal += expenses.primary_house_taxes; }
            if (expenses.primary_house_utilities) { lines.push(`    Utilities: $${formatNum(expenses.primary_house_utilities)}`); personATotal += expenses.primary_house_utilities; }
            if (expenses.primary_house_insurance) { lines.push(`    Insurance: $${formatNum(expenses.primary_house_insurance)}`); personATotal += expenses.primary_house_insurance; }
            if (expenses.primary_house_maintenance) { lines.push(`    Maintenance: $${formatNum(expenses.primary_house_maintenance)}`); personATotal += expenses.primary_house_maintenance; }
        }
    }

    // Medical & Care
    if (expenses.medical || expenses.memory_care) {
        lines.push('  Medical & Care:');
        if (expenses.medical) { lines.push(`    Medical: $${formatNum(expenses.medical)}`); personATotal += expenses.medical; }
        if (expenses.memory_care) { lines.push(`    Memory Care: $${formatNum(expenses.memory_care)}`); personATotal += expenses.memory_care; }
    }

    // Taxes & IRMAA
    const irmaa = expenses.irmaa || 0;
    if (expenses.federal_income_tax || expenses.oregon_income_tax || irmaa > 0) {
        lines.push('  Taxes:');
        if (expenses.federal_income_tax) { lines.push(`    Federal: $${formatNum(expenses.federal_income_tax)}`); personATotal += expenses.federal_income_tax; }
        if (expenses.oregon_income_tax) { lines.push(`    Oregon: $${formatNum(expenses.oregon_income_tax)}`); personATotal += expenses.oregon_income_tax; }
        if (irmaa > 0) { lines.push(`    IRMAA: $${formatNum(irmaa)}`); personATotal += irmaa; }
    }

    // Debt
    if (expenses.heloc_interest) {
        lines.push('  Debt:');
        lines.push(`    HELOC Interest: $${formatNum(expenses.heloc_interest)}`);
        personATotal += expenses.heloc_interest;
    }

    lines.push('  ────────────────────────');
    lines.push(`  Person A Subtotal: $${formatNum(personATotal)}`);

    // ═══ MAPT TRUST EXPENSES ═══
    if (isMapt) {
        lines.push('');
        lines.push('MAPT Trust Expenses:');
        lines.push('');

        let trustTotal = 0;

        // Mortgages
        const hasMortgage = expenses.primary_mortgage_interest || expenses.condo_mortgage_interest || expenses.condo_mortgage_principal;
        if (hasMortgage) {
            lines.push('  Mortgages:');
            if (expenses.primary_mortgage_interest) { lines.push(`    Primary (IO): $${formatNum(expenses.primary_mortgage_interest)}`); trustTotal += expenses.primary_mortgage_interest; }
            const condoMort = (expenses.condo_mortgage_interest || 0) + (expenses.condo_mortgage_principal || 0);
            if (condoMort > 0) { lines.push(`    Condo (P&I): $${formatNum(condoMort)}`); trustTotal += condoMort; }
        }

        // Condo operating
        const hasCondo = expenses.condo_property_tax || expenses.condo_hoa || expenses.condo_insurance || expenses.condo_maintenance || expenses.management_fee;
        if (hasCondo) {
            lines.push('  Condo Operating:');
            if (expenses.condo_property_tax) { lines.push(`    Property Tax: $${formatNum(expenses.condo_property_tax)}`); trustTotal += expenses.condo_property_tax; }
            if (expenses.condo_hoa) { lines.push(`    HOA: $${formatNum(expenses.condo_hoa)}`); trustTotal += expenses.condo_hoa; }
            if (expenses.condo_insurance) { lines.push(`    Insurance: $${formatNum(expenses.condo_insurance)}`); trustTotal += expenses.condo_insurance; }
            if (expenses.condo_maintenance) { lines.push(`    Maintenance: $${formatNum(expenses.condo_maintenance)}`); trustTotal += expenses.condo_maintenance; }
            if (expenses.management_fee) { lines.push(`    Management Fee: $${formatNum(expenses.management_fee)}`); trustTotal += expenses.management_fee; }
        }

        // Primary house post-MC (shifts to trust)
        if (inMC) {
            const hasHousePostMC = expenses.primary_house_taxes || expenses.primary_house_utilities || expenses.primary_house_insurance || expenses.primary_house_maintenance;
            if (hasHousePostMC) {
                lines.push('  Primary House (post-MC):');
                if (expenses.primary_house_taxes) { lines.push(`    Property Tax: $${formatNum(expenses.primary_house_taxes)}`); trustTotal += expenses.primary_house_taxes; }
                if (expenses.primary_house_utilities) { lines.push(`    Utilities: $${formatNum(expenses.primary_house_utilities)}`); trustTotal += expenses.primary_house_utilities; }
                if (expenses.primary_house_insurance) { lines.push(`    Insurance: $${formatNum(expenses.primary_house_insurance)}`); trustTotal += expenses.primary_house_insurance; }
                if (expenses.primary_house_maintenance) { lines.push(`    Maintenance: $${formatNum(expenses.primary_house_maintenance)}`); trustTotal += expenses.primary_house_maintenance; }
            }
        }

        lines.push('  ────────────────────────');
        lines.push(`  Trust Subtotal: $${formatNum(trustTotal)}`);

        lines.push('');
        lines.push('════════════════════════');
        lines.push(`Total: $${formatNum(personATotal + trustTotal)}`);
    } else {
        // Non-MAPT: mortgage and condo are also Person A expenses
        let nonMaptExtra = 0;

        const hasMortgage = expenses.primary_mortgage_interest || expenses.condo_mortgage_interest || expenses.condo_mortgage_principal;
        if (hasMortgage) {
            lines.push('  Mortgages:');
            if (expenses.primary_mortgage_interest) { lines.push(`    Primary (IO): $${formatNum(expenses.primary_mortgage_interest)}`); nonMaptExtra += expenses.primary_mortgage_interest; }
            const condoMort = (expenses.condo_mortgage_interest || 0) + (expenses.condo_mortgage_principal || 0);
            if (condoMort > 0) { lines.push(`    Condo (P&I): $${formatNum(condoMort)}`); nonMaptExtra += condoMort; }
        }

        const hasCondo = expenses.condo_property_tax || expenses.condo_hoa || expenses.condo_insurance || expenses.condo_maintenance || expenses.management_fee;
        if (hasCondo) {
            lines.push('  Condo:');
            if (expenses.condo_property_tax) { lines.push(`    Property Tax: $${formatNum(expenses.condo_property_tax)}`); nonMaptExtra += expenses.condo_property_tax; }
            if (expenses.condo_hoa) { lines.push(`    HOA: $${formatNum(expenses.condo_hoa)}`); nonMaptExtra += expenses.condo_hoa; }
            if (expenses.condo_insurance) { lines.push(`    Insurance: $${formatNum(expenses.condo_insurance)}`); nonMaptExtra += expenses.condo_insurance; }
            if (expenses.condo_maintenance) { lines.push(`    Maintenance: $${formatNum(expenses.condo_maintenance)}`); nonMaptExtra += expenses.condo_maintenance; }
            if (expenses.management_fee) { lines.push(`    Management Fee: $${formatNum(expenses.management_fee)}`); nonMaptExtra += expenses.management_fee; }
        }

        lines.push('  ────────────────────────');
        lines.push(`  Total: $${formatNum(personATotal + nonMaptExtra)}`);
    }

    return lines.join('\n');
};

// Format Net Cashflow tooltip - explains calculation
exports.formatNetCashflowTooltip = function(income, expenses, projection) {
    if (!income || !expenses) return '';

    const formatNum = (num) => Math.round(num || 0).toLocaleString('en-US');
    const lines = [];

    const netCashflow = (income.total || 0) - (expenses.total || 0);

    lines.push('Net Cashflow Calculation:');
    lines.push('');
    lines.push(`Budget (all cash inflow): $${formatNum(income.total)}`);
    lines.push(`Base Expenses (all outflow): -$${formatNum(expenses.total)}`);
    lines.push('────────────────────────');
    lines.push(`Net Cashflow: $${formatNum(netCashflow)}`);
    lines.push('');
    lines.push('Important Notes:');
    lines.push('');
    lines.push('• Federal tax is included in Base Expenses');
    lines.push('• This is net ANNUAL cashflow');
    lines.push('• Withholdings NOT modeled separately');
    lines.push('  (IRA distributions and tax payments');
    lines.push('   are treated as annual net amounts)');
    lines.push('');
    lines.push('• Negative cashflow funded by:');
    lines.push('  1. LTC Savings (50% of shortfall)');
    lines.push('  2. IRA distributions');
    lines.push('  3. HELOC (if IRAs insufficient)');
    lines.push('  4. Real estate sale (if debt > 60% LTV)');

    // Ending cash balances
    if (projection) {
        lines.push('');
        lines.push('────────────────────────');
        lines.push('Ending Cash Balances:');
        lines.push('');
        if (projection.ltc_savings_close !== undefined)
            lines.push(`  LTC Savings: $${formatNum(projection.ltc_savings_close)}`);
        if (projection.trust_balance !== undefined)
            lines.push(`  MAPT Checking: $${formatNum(projection.trust_balance)}`);
        if (projection.snt_balance !== undefined)
            lines.push(`  SNT Balance: $${formatNum(projection.snt_balance)}`);
        const cashTotal = (projection.ltc_savings_close || 0) + (projection.trust_balance || 0) + (projection.snt_balance || 0);
        lines.push('────────────────────────');
        lines.push(`  Total Cash: $${formatNum(cashTotal)}`);
    }

    return lines.join('\n');
};

// Format tax deduction display (federal and Oregon)
exports.formatDeductionDisplay = function(projection) {
    if (!projection) return '';

    const formatNum = (num) => {
        var k = Math.round((num || 0) / 1000);
        if (k === 0 && num !== 0) return Math.round(num).toLocaleString('en-US');
        return k.toLocaleString('en-US') + 'k';
    };
    const fedAmt = projection.deduction_amount;
    const fedType = projection.deduction_type;
    const orAmt = projection.oregon_deduction_amount;
    const orType = projection.oregon_deduction_type;
    const breakdown = projection.itemized_breakdown;

    // Yellow triangle if standard deduction was used (unusual)
    const fedWarn = fedType === 'standard' ? ' \u26A0' : '';
    const orWarn = orType === 'standard' ? ' \u26A0' : '';

    // Schedule A/E split line (if itemized breakdown available)
    let splitLine = '';
    if (breakdown && breakdown.schedule_a_total != null) {
        splitLine = `<div style="font-size: 0.8em; color: #aaa;">(${formatNum(breakdown.schedule_a_total)} A / ${formatNum(breakdown.schedule_e_total)} E)</div>`;
    }

    // If both use the same deduction type and amount
    if (fedType === orType && Math.abs(fedAmt - orAmt) < 1) {
        return `$${formatNum(fedAmt)}${fedWarn}${splitLine}`;
    }

    // Different deductions for federal and Oregon
    return `<div>Fed: $${formatNum(fedAmt)}${fedWarn}</div><div>OR: $${formatNum(orAmt)}${orWarn}</div>${splitLine}`;
};

// Format Tax Deductions tooltip - shows standard vs itemized breakdown
exports.formatDeductionsTooltip = function(projection) {
    if (!projection || !projection.itemized_breakdown) return '';

    const formatNum = (num) => Math.round(num || 0).toLocaleString('en-US');
    const breakdown = projection.itemized_breakdown;
    const lines = [];

    lines.push('Tax Deductions:');

    if (projection.deduction_type === 'standard') {
        lines.push('\u26A0 Standard deduction used ($' + formatNum(breakdown.standard_deduction) + ')');
        lines.push('  Itemized total ($' + formatNum(breakdown.itemized_total) + ') was lower.');
    }
    lines.push('');

    // Schedule A: Personal itemized deductions
    lines.push('Schedule A (Personal):');

    if (breakdown.medical_deductible > 0) {
        lines.push(`  Medical Expenses: $${formatNum(breakdown.medical_deductible)}`);
        lines.push(`    Total Medical: $${formatNum(breakdown.medical_total)}`);
        lines.push(`    AGI Threshold (7.5%): -$${formatNum(breakdown.medical_threshold)}`);
    } else if (breakdown.medical_total > 0) {
        lines.push(`  Medical Expenses: $0 (below 7.5% AGI)`);
    }

    if (breakdown.property_tax_deductible > 0) {
        lines.push(`  Property Tax: $${formatNum(breakdown.property_tax_deductible)}`);
        if (breakdown.property_tax_total > breakdown.property_tax_deductible) {
            lines.push(`    (SALT capped at $10,000)`);
        }
    }

    if (breakdown.mortgage_interest > 0) {
        lines.push(`  Mortgage Interest: $${formatNum(breakdown.mortgage_interest)}`);
        if (breakdown.primary_mortgage_interest > 0) {
            lines.push(`    Primary (IO): $${formatNum(breakdown.primary_mortgage_interest)}`);
        }
        if (breakdown.condo_mortgage_interest > 0) {
            lines.push(`    Condo (P&I): $${formatNum(breakdown.condo_mortgage_interest)}`);
        }
    }

    lines.push(`  Subtotal A: $${formatNum(breakdown.schedule_a_total)}`);

    // Schedule E: Rental property deductions
    if (breakdown.schedule_e_total > 0) {
        lines.push('');
        lines.push('Schedule E (Rental):');

        if (breakdown.rental_expenses > 0) {
            lines.push(`  Rental Expenses: $${formatNum(breakdown.rental_expenses)}`);
            lines.push(`    (See Base Expenses)`);
        }

        if (breakdown.depreciation > 0) {
            lines.push(`  Depreciation: $${formatNum(breakdown.depreciation)}`);
            if (breakdown.condo_value > 0) {
                lines.push(`    (80% of $${formatNum(breakdown.condo_value)} / 27.5yr)`);
            }
        }

        lines.push(`  Subtotal E: $${formatNum(breakdown.schedule_e_total)}`);
    }

    lines.push('');
    lines.push(`Total Itemized: $${formatNum(breakdown.itemized_total)}`);
    lines.push(`Federal Standard: $${formatNum(breakdown.standard_deduction)}`);
    lines.push('────────────────────────');
    lines.push(`Federal Using: $${formatNum(projection.deduction_amount)} (${projection.deduction_type})`);

    // Add Oregon deduction info
    if (projection.oregon_deduction_amount !== undefined) {
        lines.push('');
        lines.push('Oregon State Deduction:');
        lines.push(`Oregon Standard: $2,605`);
        lines.push(`Federal Itemized: $${formatNum(breakdown.itemized_total)}`);
        lines.push('────────────────────────');
        lines.push(`Oregon Using: $${formatNum(projection.oregon_deduction_amount)} (${projection.oregon_deduction_type})`);

        // Note if Oregon uses different deduction than federal
        if (projection.deduction_type !== projection.oregon_deduction_type) {
            lines.push('');
            lines.push('⚠️ Note: Oregon can use federal itemized');
            lines.push('   deductions even if federal uses standard!');
        }
    }

    // Add AGI reference
    if (projection.agi !== undefined) {
        lines.push('');
        lines.push(`AGI: $${formatNum(projection.agi)}`);
    }

    return lines.join('\n');
};

// Format MAPT Net tooltip — trust income, expenses, balance
exports.formatMaptTooltip = function(projection) {
    if (!projection) return '';

    const formatNum = (num) => Math.round(num || 0).toLocaleString('en-US');
    const lines = [];
    const exp = projection.expenses || {};

    lines.push('=== MAPT Trust Income ===');
    if (projection.income && projection.income.rental) {
        lines.push(`Condo Rental: $${formatNum(projection.income.rental)}`);
    }
    if (projection.income && projection.income.roommate) {
        lines.push(`Roommate Rent: $${formatNum(projection.income.roommate)}`);
        if (projection.roommate_tax > 0) {
            lines.push(`  Tax (30%): -$${formatNum(projection.roommate_tax)}`);
            lines.push(`  Net to trust: $${formatNum(projection.roommate_net_to_trust)}`);
        }
        if (projection.roommate_depreciation > 0) {
            lines.push(`  Depreciation: $${formatNum(projection.roommate_depreciation)}`);
        }
    }

    lines.push('');
    lines.push('=== MAPT Trust Expenses ===');
    lines.push('--- Condo ---');
    if (exp.condo_property_tax) lines.push(`  Property Tax: -$${formatNum(exp.condo_property_tax)}`);
    if (exp.condo_hoa) lines.push(`  HOA: -$${formatNum(exp.condo_hoa)}`);
    if (exp.condo_insurance) lines.push(`  Insurance: -$${formatNum(exp.condo_insurance)}`);
    if (exp.condo_maintenance) lines.push(`  Maintenance: -$${formatNum(exp.condo_maintenance)}`);
    if (exp.management_fee) lines.push(`  Mgmt Fee: -$${formatNum(exp.management_fee)}`);

    lines.push('--- Primary House ---');
    if (exp.primary_mortgage_interest) lines.push(`  Mortgage (IO): -$${formatNum(exp.primary_mortgage_interest)}`);
    if (projection.in_memory_care) {
        if (exp.primary_house_taxes) lines.push(`  Property Tax: -$${formatNum(exp.primary_house_taxes)}`);
        if (exp.primary_house_insurance) lines.push(`  Insurance: -$${formatNum(exp.primary_house_insurance)}`);
        if (exp.primary_house_maintenance) lines.push(`  Maintenance: -$${formatNum(exp.primary_house_maintenance)}`);
        if (exp.primary_house_utilities) lines.push(`  Utilities: -$${formatNum(exp.primary_house_utilities)}`);
    } else {
        lines.push('  (Person A pays as occupant)');
    }

    if (projection.mapt_property_expenses) {
        lines.push(`Total Trust Expenses: -$${formatNum(projection.mapt_property_expenses)}`);
    }

    lines.push('');
    lines.push('=== Trust Balance ===');
    if (projection.mapt_checking_open !== undefined) {
        lines.push(`Opening: $${formatNum(projection.mapt_checking_open)}`);
    }
    lines.push(`Closing: $${formatNum(projection.trust_balance)}`);
    if (projection.snt_balance > 0) {
        lines.push(`SNT: $${formatNum(projection.snt_balance)}`);
    }
    if (projection.mapt_trust_shortfall > 0) {
        lines.push(`SHORTFALL: $${formatNum(projection.mapt_trust_shortfall)}`);
    }

    return lines.join('\n');
};
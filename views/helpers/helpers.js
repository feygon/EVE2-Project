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

// Format number with commas (e.g., 1234567 -> 1,234,567)
exports.formatNumber = function(num) {
    if (typeof num === 'undefined' || num === null) return '0';
    return Math.round(num).toLocaleString('en-US');
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
        if (key !== 'total') count++;
    }

    return count;
};

// Add helper for summing numbers
exports.add = function(...args) {
    // Remove the options object (last argument)
    const options = args.pop();
    return args.reduce((sum, num) => sum + (num || 0), 0);
};

// Multiply helper
exports.multiply = function(a, b) {
    return (a || 0) * (b || 0);
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
        const mortgageRate = projection.mortgage_rate
            ? (projection.mortgage_rate * 100).toFixed(2) + '%'
            : '6.00%';
        tooltip += `\nMortgage Balance: -$${formatNum(projection.mortgage_balance)} (${mortgageRate} interest)`;
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

    if (income.rental) {
        lines.push(`Rental Income: $${formatNum(income.rental)}`);
    }

    if (income.ltc_payout) {
        lines.push(`LTC Policy Payout: $${formatNum(income.ltc_payout)}`);
    }

    if (income.sma_payments) {
        lines.push(`SMA Payments: $${formatNum(income.sma_payments)}`);
    }

    lines.push('────────────────────────');
    lines.push(`Total Budget: $${formatNum(income.total)}`);

    // Note about rental income earmarking
    if (income.rental && income.rental > 0) {
        lines.push('');
        lines.push('Note: Rental income is earmarked for');
        lines.push('condo expenses (mortgage, management,');
        lines.push('taxes, etc.) and is ADDITIONAL to the');
        lines.push('Pre-Memory Care Gross Expenses slider.');
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

    // Social Security (full amount)
    if (projection.income && projection.income.ssdi) {
        lines.push(`Social Security: $${formatNum(projection.income.ssdi)}`);
    }

    // Rental income (full amount)
    if (projection.income && projection.income.rental) {
        lines.push(`Rental Income: $${formatNum(projection.income.rental)}`);
    }

    // IRA distributions (including HELOC if drawn)
    if (projection.income && projection.income.ira_distributions) {
        lines.push(`IRA Distributions: $${formatNum(projection.income.ira_distributions)}`);
        if (projection.heloc_drawn && projection.heloc_drawn > 0) {
            lines.push(`  (includes $${formatNum(projection.heloc_drawn)} HELOC)`);
        }
    }

    lines.push('────────────────────────');
    lines.push(`Total Taxable Sources: $${formatNum(projection.taxable_income_total || 0)}`);
    lines.push('');
    lines.push('Adjusted Gross Income (AGI):');
    lines.push('');

    // AGI breakdown - what actually gets taxed
    if (projection.income && projection.income.ssdi) {
        const taxableSS = projection.income.ssdi * 0.85;
        lines.push(`SS (85% taxable): $${formatNum(taxableSS)}`);
    }

    if (projection.income && projection.income.rental) {
        lines.push(`Rental (100% taxable): $${formatNum(projection.income.rental)}`);
    }

    if (projection.income && projection.income.ira_distributions) {
        const totalIRA = projection.income.ira_distributions;
        const helocDrawn = projection.heloc_drawn || 0;
        const taxableIRA = totalIRA - helocDrawn;

        if (helocDrawn > 0) {
            lines.push(`IRA (excluding HELOC): $${formatNum(taxableIRA)}`);
        } else if (taxableIRA > 0) {
            lines.push(`IRA: $${formatNum(taxableIRA)}`);
        }
    }

    lines.push('────────────────────────');
    lines.push(`AGI (amount taxed): $${formatNum(projection.agi || 0)}`);

    return lines.join('\n');
};

// Format Expenses tooltip - grouped by category
exports.formatExpensesTooltip = function(expenses) {
    if (!expenses || typeof expenses !== 'object') return '';

    const formatNum = (num) => Math.round(num || 0).toLocaleString('en-US');
    const lines = [];

    lines.push('Base Expenses:');
    lines.push('');

    // Primary House expenses
    const primaryExpenses = [];
    let primaryTotal = 0;
    if (expenses.primary_house_taxes) {
        primaryExpenses.push(`  Property Taxes: $${formatNum(expenses.primary_house_taxes)}`);
        primaryTotal += expenses.primary_house_taxes;
    }
    if (expenses.primary_house_utilities) {
        primaryExpenses.push(`  Utilities: $${formatNum(expenses.primary_house_utilities)}`);
        primaryTotal += expenses.primary_house_utilities;
    }
    if (expenses.primary_house_insurance) {
        primaryExpenses.push(`  Insurance: $${formatNum(expenses.primary_house_insurance)}`);
        primaryTotal += expenses.primary_house_insurance;
    }
    if (expenses.primary_house_maintenance) {
        primaryExpenses.push(`  Maintenance: $${formatNum(expenses.primary_house_maintenance)}`);
        primaryTotal += expenses.primary_house_maintenance;
    }
    if (primaryExpenses.length > 0) {
        lines.push(`Primary House: $${formatNum(primaryTotal)}`);
        lines.push(...primaryExpenses);
    }

    // Condo expenses
    const condoExpenses = [];
    let condoTotal = 0;
    if (expenses.management_fee) {
        condoExpenses.push(`  Management Fee: $${formatNum(expenses.management_fee)}`);
        condoTotal += expenses.management_fee;
    }
    if (expenses.mortgage_payment_total) {
        condoExpenses.push(`  Mortgage Payment Total: $${formatNum(expenses.mortgage_payment_total)}`);
        condoTotal += expenses.mortgage_payment_total;
    }
    if (expenses.condo_hoa) {
        condoExpenses.push(`  HOA Fee: $${formatNum(expenses.condo_hoa)}`);
        condoTotal += expenses.condo_hoa;
    }
    if (expenses.condo_maintenance) {
        condoExpenses.push(`  Maintenance: $${formatNum(expenses.condo_maintenance)}`);
        condoTotal += expenses.condo_maintenance;
    }
    if (expenses.condo_property_tax) {
        condoExpenses.push(`  Property Taxes: $${formatNum(expenses.condo_property_tax)}`);
        condoTotal += expenses.condo_property_tax;
    }
    if (condoExpenses.length > 0) {
        lines.push('');
        lines.push(`Condo: $${formatNum(condoTotal)}`);
        lines.push(...condoExpenses);
    }

    // Other expenses
    if (expenses.memory_care) {
        lines.push('');
        lines.push(`Memory Care: $${formatNum(expenses.memory_care)}`);
    }
    if (expenses.heloc_interest) {
        lines.push(`HELOC Interest: $${formatNum(expenses.heloc_interest)}`);
    }
    if (expenses.federal_income_tax) {
        lines.push(`Federal Income Tax: $${formatNum(expenses.federal_income_tax)}`);
    }
    if (expenses.lifestyle) {
        lines.push(`Lifestyle: $${formatNum(expenses.lifestyle)}`);
    }

    lines.push('────────────────────────');
    lines.push(`Total Expenses: $${formatNum(expenses.total)}`);

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

    return lines.join('\n');
};

// Format Tax Deductions tooltip - shows standard vs itemized breakdown
exports.formatDeductionsTooltip = function(projection) {
    if (!projection || !projection.itemized_breakdown) return '';

    const formatNum = (num) => Math.round(num || 0).toLocaleString('en-US');
    const breakdown = projection.itemized_breakdown;
    const lines = [];

    lines.push('Tax Deductions:');
    lines.push('');

    // Show itemized breakdown
    lines.push('Itemized Deductions:');

    if (breakdown.medical_deductible > 0) {
        lines.push(`  Medical Expenses: $${formatNum(breakdown.medical_deductible)}`);
        lines.push(`    Total Medical: $${formatNum(breakdown.medical_total)}`);
        lines.push(`    AGI Threshold (7.5%): -$${formatNum(breakdown.medical_threshold)}`);
        lines.push(`    Deductible: $${formatNum(breakdown.medical_deductible)}`);
    } else if (breakdown.medical_total > 0) {
        lines.push(`  Medical Expenses: $0 (below AGI threshold)`);
        lines.push(`    Total Medical: $${formatNum(breakdown.medical_total)}`);
        lines.push(`    AGI Threshold (7.5%): $${formatNum(breakdown.medical_threshold)}`);
    }

    if (breakdown.property_tax_deductible > 0) {
        lines.push(`  Property Tax: $${formatNum(breakdown.property_tax_deductible)}`);
        if (breakdown.property_tax_total > breakdown.property_tax_deductible) {
            lines.push(`    (SALT capped at $10,000)`);
        }
    }

    if (breakdown.mortgage_interest > 0) {
        lines.push(`  Mortgage Interest: $${formatNum(breakdown.mortgage_interest)}`);
    }

    lines.push('');
    lines.push(`Total Itemized: $${formatNum(breakdown.itemized_total)}`);
    lines.push(`Standard Deduction: $${formatNum(breakdown.standard_deduction)}`);
    lines.push('────────────────────────');
    lines.push(`Using: $${formatNum(projection.deduction_amount)} (${projection.deduction_type})`);

    // Add AGI reference
    if (projection.agi !== undefined) {
        lines.push('');
        lines.push(`AGI: $${formatNum(projection.agi)}`);
    }

    return lines.join('\n');
};
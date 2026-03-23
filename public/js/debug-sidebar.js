/**
 * Debug Sidebar Renderer
 * Renders detailed year-by-year financial calculations in the tooltip sidebar.
 */
(function() {
    'use strict';

    var $ = window.jQuery;

    function fmt(val) {
        if (val === null || val === undefined) return 'null';
        if (typeof val === 'boolean') return val ? 'YES' : 'no';
        if (typeof val === 'number') {
            if (Number.isInteger(val) && val > 1900 && val < 2100) return val.toString();
            if (Math.abs(val) < 1 && val !== 0) return (val * 100).toFixed(2) + '%';
            return '$' + Math.round(val).toLocaleString('en-US');
        }
        return String(val);
    }

    function fmtMo(annual) {
        return '$' + Math.round(annual / 12).toLocaleString('en-US') + '/mo';
    }

    function calc(label, formula, result) {
        return '<div style="color:#888;font-size:11px;margin-left:12px;">' + label + ' = ' + formula + '</div>' +
               '<div><span class="debug-key">' + label + '</span>: <span class="debug-val">' + result + '</span></div>';
    }

    function line(key, val, legend) {
        return '<div><span class="debug-key">' + key + '</span>: <span class="debug-val">' + fmt(val) + '</span>' +
               (legend ? ' <span style="color:#666;font-size:11px;">— ' + legend + '</span>' : '') + '</div>';
    }

    function sectionStart(title) {
        return '<div class="debug-section"><h4>' + title + '</h4>';
    }

    // Set of debug-sidebar keys whose values are directly editable from the parameter sidebar.
    // Asterisk (*) is appended to the label so the user knows they can change it.
    var EDITABLE_PARAMS = {
        'primary_appreciation_rate': true,
        'condo_appreciation_rate': true,
        'primary_mortgage_balance': true,
        'condo_mortgage_balance': true,
        'mortgage_split_pct': true,
        'primary_mortgage_rate': true,
        'condo_mortgage_rate': true,
        'heloc_rate': true,
        'sdira_checking_open': true,
        'managed_ira_open': true,
        'managed_ira_growth_rate': true,
        'personal_budget': true
    };

    // Wraps key with asterisk if it's an editable param
    function eKey(key) {
        return EDITABLE_PARAMS[key] ? '<span style="color:#e74c3c;">*</span>' + key : key;
    }

    function renderYearData(d) {
        var sc = window.scenarioConfig || {};
        var isMAPT = sc.condo_disposition === 'trust_mapt';
        var roommateOn = sc.roommate_enabled === 1;
        var exp = d.expenses || {};
        var html = '<div class="debug-sidebar-content">';
        html += '<div style="color:#666;font-size:11px;margin-bottom:10px;"><span style="color:#e74c3c;">*</span> = editable from parameter sidebar</div>';

        // === Real Estate === (moved to top)
        html += sectionStart('Real Estate');
        var hRate = sc.primary_appreciation || 0.06;
        var cRate = sc.condo_appreciation || 0.05;
        html += line(eKey('primary_appreciation_rate'), hRate, 'Primary house appreciation rate');
        if (d.house_appreciation) {
            html += calc('house_appreciation', 'house_value_prev * ' + fmt(hRate),
                fmt(d.house_value - d.house_appreciation) + ' * ' + fmt(hRate) + ' = ' + fmt(d.house_appreciation));
        }
        html += line('house_value [EOY]', d.house_value, 'Primary house market value after appreciation');
        if (d.condo_value > 0 || d.condo_sold) {
            html += '';
            html += line(eKey('condo_appreciation_rate'), cRate, 'Condo appreciation rate');
            if (d.condo_appreciation) {
                html += calc('condo_appreciation', 'condo_value_prev * ' + fmt(cRate),
                    fmt(d.condo_value - d.condo_appreciation) + ' * ' + fmt(cRate) + ' = ' + fmt(d.condo_appreciation));
            }
            html += line('condo_value [EOY]', d.condo_value, 'Condo market value after appreciation');
            if (d.condo_sold) html += line('condo_sold', d.condo_sold, 'Condo was sold this year');
            if (d.condo_sale_proceeds) html += line('condo_sale_proceeds', d.condo_sale_proceeds, 'Net proceeds from condo sale');
        }
        html += line('real_estate_total [EOY]', d.real_estate_total, 'Combined RE value');
        html += '</div>';

        // === Mortgage & HELOC ===
        if (d.primary_mortgage_balance || d.condo_mortgage_balance || d.heloc_balance) {
            html += sectionStart('Mortgage & HELOC');
            var splitRaw = sc.mortgage_split_pct || 0.80;
            var splitPct = Math.round(splitRaw * 100);
            var condoPct = 100 - splitPct;
            html += line(eKey('mortgage_split_pct'), splitPct + '% / ' + condoPct + '%', 'Primary (IO) / Condo (30yr P&I) split of total mortgage');
            if (d.primary_mortgage_balance) {
                html += line(eKey('primary_mortgage_balance'), d.primary_mortgage_balance, splitPct + '% of total mortgage, 15yr IO balloon at 840 credit');
                html += line(eKey('primary_mortgage_rate'), d.primary_mortgage_rate, 'Primary house mortgage interest rate, 15yr IO balloon at 840 credit');
                if (exp.primary_mortgage_interest) {
                    html += calc('primary_mortgage_interest', 'balance * rate',
                        fmt(d.primary_mortgage_balance) + ' * ' + fmt(d.primary_mortgage_rate) + ' = ' + fmt(exp.primary_mortgage_interest) + ' (' + fmtMo(exp.primary_mortgage_interest) + ')');
                }
            }
            if (d.condo_mortgage_balance) {
                html += line(eKey('condo_mortgage_balance'), d.condo_mortgage_balance, condoPct + '% of total mortgage, 30yr fixed P&I at 840 credit, paid off at Medicaid activation');
                html += line(eKey('condo_mortgage_rate'), d.condo_mortgage_rate, 'Condo mortgage rate, 30yr fixed at 840 credit');
                if (exp.condo_mortgage_interest || exp.condo_mortgage_principal) {
                    var condoTotal = (exp.condo_mortgage_interest || 0) + (exp.condo_mortgage_principal || 0);
                    html += line('condo_mortgage_payment', condoTotal, 'Condo P&I annual (' + fmtMo(condoTotal) + ')');
                    html += line('  condo_interest', exp.condo_mortgage_interest, '');
                    html += line('  condo_principal', exp.condo_mortgage_principal, '');
                }
                html += line('condo_mortgage_close [EOY]', d.condo_mortgage_close, 'Condo mortgage after principal paid');
            }
            if (exp.mortgage_payment_total) {
                html += line('mortgage_payment_total', exp.mortgage_payment_total, 'Total mortgage payments (' + fmtMo(exp.mortgage_payment_total) + ')');
            }
            if (d.heloc_balance) {
                html += line('heloc_balance [EOY]', d.heloc_balance, 'HELOC balance carried forward');
                html += line(eKey('heloc_rate'), d.heloc_rate, 'HELOC interest rate, variable rate at 840 credit');
            }
            if (d.heloc_drawn) html += line('heloc_drawn', d.heloc_drawn, 'HELOC drawn this year');
            html += '</div>';
        }

        // === IRA ===
        var iraEmpty = d.total_ira_open === 0 && d.total_ira_close === 0 && !d.annuity_payments;
        if (iraEmpty) {
            html += sectionStart('IRA');
            // Find the liquidation year data from projectionData
            var liqYear = null;
            if (window.projectionData) {
                liqYear = window.projectionData.find(function(y) { return y.medicaid_invoked && y.snt_funded_gross; });
            }
            if (liqYear) {
                var ld = d.medicaid_invoked ? d : liqYear; // use current year if it's the trigger, otherwise reference the trigger year
                // Show liquidation details
                html += '<div style="color:#e74c3c;font-weight:600;">IRA Liquidated → SNT at Medicaid Activation (' + ld.year + ')</div>';
                html += line('gross_liquidation', ld.snt_funded_gross, '');
                if (ld.snt_funded_liquid) html += line('  liquid_balances', ld.snt_funded_liquid, 'IRA + savings');
                if (ld.snt_funded_annuity_surrender) html += line('  annuity_surrender', ld.snt_funded_annuity_surrender, 'Remaining payments at 85% (15% surrender loss)');
                html += '';
                html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">Tax Withholding (split Dec/Jan):</div>';
                html += line('  Year 1 (Dec ' + (ld.year - 1) + ')', ld.liquidation_tax_year1, 'Half liquidated in Dec. Medical deduction ' + fmt(ld.liquidation_year1_deduction) + ' (memory care ' + fmt(ld.liquidation_year1_medical) + ' - 7.5% AGI floor)');
                html += line('  Year 2 (Jan ' + ld.year + ')', ld.liquidation_tax_year2, 'Remaining half in Jan. Standard deduction ' + fmt(ld.liquidation_year2_deduction));
                html += line('  total_withholding', ld.liquidation_tax_withholding, '');
                var effectiveRate = ld.liquidation_tax_withholding / ld.snt_funded_gross;
                html += '<div style="color:#666;font-size:11px;margin-left:12px;">Effective rate: ' + (effectiveRate * 100).toFixed(1) + '% on gross (split reduces bracket vs single-year)</div>';
                html += '';
                html += line('after_tax', ld.snt_funded_gross - ld.liquidation_tax_withholding, '');
                if (ld.snt_funded_mortgage_payoff) html += line('  condo_mortgage_payoff', ld.snt_funded_mortgage_payoff, 'SNT condo paid off');
                html += line('net_to_snt', ld.snt_funded, 'After tax + mortgage payoff');
            } else {
                html += '<div style="color:#555;">IRA liquidated — no balances or payments</div>';
            }
            html += '</div>';
        } else {
        html += sectionStart('IRA');
        html += line(eKey('sdira_checking_open'), d.sdira_checking_open, 'SDIRA Checking balance (start of year)');
        if (d.annuity_payments) {
            html += calc('sdira_checking_available', 'sdira_checking_open + annuity_payments',
                fmt(d.sdira_checking_open) + ' + ' + fmt(d.annuity_payments) + ' = ' + fmt(d.sdira_checking_available));
            if (d.annuity_payments_h1 || d.annuity_payments_h2) {
                html += '<div style="color:#666;font-size:11px;margin-left:12px;">H1 (Jan-Jun): ' + fmt(d.annuity_payments_h1 || 0) + ' | H2 (Jul-Dec): ' + fmt(d.annuity_payments_h2 || 0) + '</div>';
            }
            html += '<div style="color:#666;font-size:11px;margin-left:12px;">SMA annuities paid monthly. LS7 matures Jan. LS6 matures Jun.</div>';
        }
        if (d.sdira_distributions) html += line('sdira_distributions', d.sdira_distributions, 'Withdrawn from SDIRA Checking for expenses & lifestyle');
        html += '<div><span class="debug-key">sdira_checking_close [EOY]</span>: <span class="debug-val">' + fmt(d.sdira_checking_available || d.sdira_checking_open) + ' - ' + fmt(d.sdira_distributions || 0) + ' = ' + fmt(d.sdira_checking_close) + '</span></div>';
        html += '';
        html += line(eKey('managed_ira_open'), d.managed_ira_open, 'Managed IRA balance (start of year). NOTE: Check with advisor for exact amount');
        if (d.managed_ira_distributions) html += line('managed_ira_distributions', d.managed_ira_distributions, 'Withdrawn from Managed IRA');
        if (d.managed_ira_growth !== undefined && d.managed_ira_growth !== 0) {
            html += calc('managed_ira_growth', 'managed_ira_close_pre_growth * managed_ira_growth_rate',
                fmt(d.managed_ira_close - d.managed_ira_growth) + ' * ' + fmt(d.managed_ira_growth_rate) + ' = ' + fmt(d.managed_ira_growth));
        }
        html += line(eKey('managed_ira_growth_rate'), d.managed_ira_growth_rate, 'NOTE: Check with advisor for expected IRA growth');
        html += line('managed_ira_close [EOY]', d.managed_ira_close, 'Managed IRA balance after growth');
        html += '';
        html += line('total_ira_open', d.total_ira_open, 'Combined IRA (start of year)');
        html += line('total_ira_close [EOY]', d.total_ira_close, 'Combined IRA after distributions and growth');
        if (d.rmd_enforced) {
            html += line('rmd_amount', d.rmd_amount, 'Required Minimum Distribution enforced');
        }
        html += '<div style="color:#555;font-size:11px;margin-top:4px;">See Annuity Schedule below.</div>';
        html += '</div>';
        } // end IRA else

        // === LTC Savings ===
        if (d.ltc_savings_open || d.ltc_savings_close || d.ltc_savings_spent) {
            html += sectionStart('LTC Savings');
            html += line('ltc_savings_open', d.ltc_savings_open, 'LTC Savings (start of year)');
            if (d.income && d.income.ltc_payout) html += line('ltc_disbursement', d.income.ltc_payout, 'LTC insurance payout deposited to savings');
            if (d.ltc_savings_spent) html += line('ltc_savings_spent', d.ltc_savings_spent, 'Spent from LTC Savings this year');
            html += line('ltc_savings_close [EOY]', d.ltc_savings_close, 'LTC Savings after payouts and spending');
            html += '</div>';
        }

        // === LTC Contract ===
        var ltc = window.ltcPolicyData;
        if (ltc) {
            var triggerYear = sc.ltc_trigger_year || 2028;
            var baseYear = 2026;
            var yearsToTrigger = triggerYear - baseYear;
            var inflRate = ltc.pool_inflation_rate || 0.05;
            var poolAtTrigger = ltc.current_pool * Math.pow(1 + inflRate, yearsToTrigger);
            var payoutDays = ltc.payout_days || 1460;
            var payoutYears = payoutDays / 365;
            var dailyBenefit = poolAtTrigger / payoutDays;
            var annualPayout = dailyBenefit * 365;
            var yearsSinceTrigger = Math.max(0, d.year - triggerYear);
            var payoutActive = d.year >= triggerYear && yearsSinceTrigger < payoutYears;
            var poolRemaining = payoutActive ? poolAtTrigger - (annualPayout * yearsSinceTrigger) : (d.year < triggerYear ? ltc.current_pool * Math.pow(1 + inflRate, d.year - baseYear) : 0);
            var payoutEndYear = triggerYear + Math.floor(payoutYears);

            html += sectionStart('LTC Contract');
            html += line('policy_type', ltc.policy_type, ltc.tax_qualified ? 'Tax-qualified (IRC §7702B)' : '');
            html += line('trigger_condition', ltc.trigger_condition, ltc.elimination_trigger || '');
            html += '<div><span class="debug-key">elimination_days</span>: <span class="debug-val">' + ltc.elimination_days + ' days</span> <span style="color:#666;font-size:11px;">— before payout begins</span></div>';
            html += '';
            html += line('current_pool (base)', ltc.current_pool, 'Pool value as of 7/20/2026. Daily benefit increases 5% each July 20th');
            html += line('pool_inflation_rate', inflRate, ltc.pool_inflation_type + ', active until ' + (ltc.inflation_active_until || 'claim start'));
            if (d.year < triggerYear) {
                var poolThisYear = ltc.current_pool * Math.pow(1 + inflRate, d.year - baseYear);
                html += calc('pool_value (' + d.year + ')', 'current_pool * (1 + ' + fmt(inflRate) + ')^' + (d.year - baseYear),
                    fmt(ltc.current_pool) + ' * ' + (1 + inflRate).toFixed(3) + '^' + (d.year - baseYear) + ' = ' + fmt(poolThisYear));
                html += '<div style="color:#555;font-size:11px;margin-left:12px;">Pool still growing — trigger in ' + triggerYear + '</div>';
            } else {
                html += line('pool_at_trigger (' + triggerYear + ')', poolAtTrigger, 'Inflated pool when claim starts');
            }
            html += '';
            html += '<div><span class="debug-key">payout_days</span>: <span class="debug-val">' + payoutDays + ' days</span> <span style="color:#666;font-size:11px;">— ' + Math.round(payoutYears * 10) / 10 + ' years of benefits</span></div>';
            if (payoutActive || d.year < triggerYear) {
                html += line('daily_benefit', dailyBenefit, 'pool_at_trigger / payout_days');
                html += line('annual_payout', annualPayout, '$' + Math.round(dailyBenefit) + '/day * 365');
                html += line('irs_per_diem_limit', ltc.irs_per_diem_limit_2026 || 430, '2026 limit — excess is taxable income');
                if (dailyBenefit > (ltc.irs_per_diem_limit_2026 || 430)) {
                    var excess = dailyBenefit - (ltc.irs_per_diem_limit_2026 || 430);
                    html += line('daily_excess', excess, 'Taxable as ordinary income');
                }
            }
            if (payoutActive) {
                html += '<div><span class="debug-key">payout_year</span>: <span class="debug-val">Year ' + (yearsSinceTrigger + 1) + ' of ' + Math.round(payoutYears) + '</span></div>';
                html += line('pool_remaining [EOY]', Math.max(0, poolRemaining), '');
                html += line('payout_ends', payoutEndYear, '');
            } else if (d.year >= payoutEndYear) {
                html += '<div style="color:#e74c3c;">LTC benefits exhausted (ended ' + payoutEndYear + ')</div>';
            }
            html += line('ltc_savings_spent', d.ltc_savings_spent || 0, 'Cash spent from LTC savings this year');
            html += '</div>';
        }

        // === Income ===
        html += sectionStart('Income');
        if (d.income) {
            // Personal income
            html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">Personal Income:</div>';
            if (d.income.ssdi) html += line('  ssdi', d.income.ssdi, 'Social Security income. Increases annually with the CPI (COLA)');
            if (d.income.ira_distributions) html += line('  ira_distributions', d.income.ira_distributions, 'Total IRA distributions');
            if (d.income.ltc_spending) html += line('  ltc_spending', d.income.ltc_spending, 'Spent from LTC savings');

            // Rental income (separate subsection)
            if (d.income.rental || d.income.roommate || (isMAPT && roommateOn && !d.in_memory_care)) {
                html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">Rental Income:</div>';
                if (d.income.rental) {
                    var rentalNote = 'Arbor Roses condo income';
                    if (d.year <= 2027) {
                        rentalNote += ', base rate (yr ' + (d.year - 2025) + ')';
                    } else {
                        rentalNote += ', after ' + (d.year - 2027) + ' yr of 4% rental increase';
                    }
                    if (isMAPT) rentalNote += ' (flows to MAPT trust)';
                    html += line('  rental', d.income.rental, rentalNote);
                }
                if (d.income.roommate) {
                    html += line('  roommate', d.income.roommate, 'Roommate rental income (primary house)');
                } else if (isMAPT && roommateOn && !d.in_memory_care) {
                    html += '<div style="color:#555;margin-left:12px;">roommate: starts at memory care</div>';
                }
            }

            // Tax withholdings (1040 / OR-40)
            if (exp.federal_income_tax || exp.oregon_income_tax) {
                html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">Tax Withholdings (1040 / OR-40):</div>';
                if (exp.federal_income_tax) html += line('  federal', exp.federal_income_tax, '');
                if (exp.oregon_income_tax) html += line('  oregon', exp.oregon_income_tax, '');
                var totalTax = (exp.federal_income_tax || 0) + (exp.oregon_income_tax || 0);
                html += line('  total_tax', totalTax, '');
            }

            // Totals
            html += '<div style="border-top:1px solid #444;margin-top:4px;padding-top:4px;">';
            html += line('Adjusted Gross Income', d.agi || d.income.total, '');
            var netPersonal = (d.income.total || 0) - ((exp.federal_income_tax || 0) + (exp.oregon_income_tax || 0));
            html += line('Net Personal Income', netPersonal, 'AGI minus tax withholdings');
            html += '</div>';
        }
        html += '</div>';

        // === Expenses ===
        html += sectionStart('Expenses');
        // Primary house
        if (exp.primary_house_taxes || exp.primary_house_insurance || exp.primary_house_maintenance || exp.primary_house_utilities) {
            html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">Primary House:</div>';
            if (exp.primary_house_taxes) html += line('  property_taxes', exp.primary_house_taxes, (isMAPT && d.in_memory_care ? '@' : ''));
            if (exp.primary_house_utilities) html += line('  utilities', exp.primary_house_utilities, (isMAPT && d.in_memory_care ? '@' : ''));
            if (exp.primary_house_insurance) html += line('  insurance', exp.primary_house_insurance, (isMAPT && d.in_memory_care ? '@' : ''));
            if (exp.primary_house_maintenance) html += line('  maintenance', exp.primary_house_maintenance, (isMAPT && d.in_memory_care ? '@' : ''));
        }
        // Condo
        if (exp.condo_property_tax || exp.condo_hoa || exp.condo_insurance || exp.condo_maintenance || exp.management_fee) {
            html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">Condo:</div>';
            if (exp.condo_property_tax) html += line('  property_taxes', exp.condo_property_tax, isMAPT ? '@' : '');
            if (exp.condo_hoa) html += line('  hoa', exp.condo_hoa, isMAPT ? '@' : '');
            if (exp.condo_insurance) html += line('  insurance', exp.condo_insurance, isMAPT ? '@' : '');
            if (exp.condo_maintenance) html += line('  maintenance', exp.condo_maintenance, isMAPT ? '@' : '');
            if (exp.management_fee) html += line('  management_fee', exp.management_fee, isMAPT ? '@' : '');
        }
        // Loans
        if (exp.primary_mortgage_interest || exp.condo_mortgage_interest || exp.condo_mortgage_principal || exp.heloc_interest) {
            html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">Loans:</div>';
            if (exp.primary_mortgage_interest) {
                html += line('  primary_mortgage (IO)', exp.primary_mortgage_interest, fmtMo(exp.primary_mortgage_interest) + (isMAPT ? ' @' : ''));
            }
            if (exp.condo_mortgage_interest || exp.condo_mortgage_principal) {
                var condoP = (exp.condo_mortgage_interest || 0) + (exp.condo_mortgage_principal || 0);
                html += line('  condo_mortgage (P&I)', condoP, fmtMo(condoP) + ', budgeted into SNT ABLE Account');
            }
            if (exp.heloc_interest) html += line('  heloc_interest', exp.heloc_interest, '');
        }
        // Other
        html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">Other:</div>';
        if (exp.medical) html += line('  medical', exp.medical, '');
        if (exp.memory_care) html += line('  memory_care', exp.memory_care, d.memory_care_medicaid ? 'Medicaid pays (1/12 transition)' : '');
        if (exp.lifestyle) html += line('  lifestyle', exp.lifestyle, 'Residual personal spending');
        var irmaaVal = exp.irmaa || 0;
        var irmaaLegend = 'IRMAA Medicare surcharge (MAGI $' + fmt(d.irmaa_lookback_magi || 0) + ' from 2yr prior)';
        html += line('  irmaa_surcharge', irmaaVal, irmaaLegend);
        var cumIrmaa = 0;
        if (window.projectionData) {
            for (var i = 0; i < window.projectionData.length; i++) {
                var py = window.projectionData[i];
                if (py.year > d.year) break;
                cumIrmaa += (py.expenses && py.expenses.irmaa) || 0;
            }
        }
        html += line('  irmaa_cumulative', cumIrmaa, 'Lifetime IRMAA paid through ' + d.year);
        html += '<div style="border-top:1px solid #444;margin-top:4px;padding-top:4px;">';
        if (isMAPT && d.mapt_property_expenses) {
            var personAExp = (exp.total || 0) - d.mapt_property_expenses;
            html += line('Person A expenses', personAExp, 'while living in primary house');
            html += line('MAPT trust expenses', d.mapt_property_expenses, '@, until Person A moves to memory care');
        }
        html += '</div>';
        if (isMAPT) html += '<div style="color:#666;font-size:11px;">@ = MAPT trust expense</div>';
        html += '</div>';

        // === Tax ===
        html += sectionStart('Tax');
        html += line('agi', d.agi, 'Adjusted Gross Income');
        html += line('taxable_income_total', d.taxable_income_total, 'Total income from taxable sources');
        if (exp.federal_income_tax !== undefined) html += line('federal_tax', exp.federal_income_tax, '');
        if (exp.oregon_income_tax !== undefined) html += line('oregon_tax', exp.oregon_income_tax, '');
        if (d.effectiveTaxRate) html += line('effective_rate', d.effectiveTaxRate, '');
        // Tax deductions subsection
        html += '<div style="color:#aac8e4;font-weight:600;margin-top:8px;">Tax Deductions:</div>';
        html += line('deduction_type', d.deduction_type, '');
        html += line('deduction_amount', d.deduction_amount, '');
        if (d.itemized_breakdown) {
            var ib = d.itemized_breakdown;
            if (ib.medical_deductible) html += line('  medical_deductible', ib.medical_deductible, 'After 7.5% AGI floor');
            if (ib.property_tax_deductible) html += line('  property_tax_deductible', ib.property_tax_deductible, 'SALT cap $10,000');
            if (ib.mortgage_interest) html += line('  mortgage_interest', ib.mortgage_interest, '');
            if (ib.depreciation) html += line('  depreciation', ib.depreciation, 'Condo rental depreciation (Sch E)');
            if (ib.rental_expenses) html += line('  rental_expenses', ib.rental_expenses, 'Condo expenses (Sch E)');
            html += line('  standard_deduction', ib.standard_deduction, 'Age 65+ standard deduction');
        }
        // Roommate depreciation info
        if (roommateOn && d.in_memory_care) {
            html += '<div style="color:#aac8e4;font-weight:600;margin-top:8px;">Roommate Depreciation (MAPT trust):</div>';
            var houseBasis = sc.primary_house_basis || 500000;
            var buildingVal = houseBasis * 0.80;
            var depr25 = buildingVal * 0.25 / 27.5;
            var depr50 = buildingVal * 0.50 / 27.5;
            html += line('  1 bedroom (1/4)', depr25, '25% of building value / 27.5yr');
            html += line('  2 bedrooms (1/2)', depr50, '50% of building value / 27.5yr');
            // Max tax-free roommate income for each
            var houseExp = (exp.primary_house_taxes || 0) + (exp.primary_house_insurance || 0) + (exp.primary_house_maintenance || 0) + (exp.primary_house_utilities || 0);
            var maxFree25 = depr25 + houseExp * 0.25;
            var maxFree50 = depr50 + houseExp * 0.50;
            html += line('  max tax-free (1 room)', maxFree25, fmtMo(maxFree25) + ' — depr + 25% house expenses');
            html += line('  max tax-free (2 rooms)', maxFree50, fmtMo(maxFree50) + ' — depr + 50% house expenses');
            if (d.roommate_tax !== undefined) {
                html += line('  actual roommate tax', d.roommate_tax, '');
                html += line('  net to trust', d.roommate_net_to_trust, '');
            }
        }
        html += '</div>';

        // === MAPT Tax ===
        if (isMAPT) {
            html += sectionStart('MAPT Trust Tax');
            // Trust income
            html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">Trust Income:</div>';
            var trustRental = d.income ? (d.income.rental || 0) : 0;
            var trustRoommate = d.income ? (d.income.roommate || 0) : 0;
            var trustGrossIncome = trustRental + trustRoommate;
            if (trustRental) html += line('  condo_rental', trustRental, 'Arbor Roses rental income');
            if (trustRoommate) html += line('  roommate_rent', trustRoommate, 'Primary house roommate income');
            if (trustGrossIncome) {
                html += line('  gross_income', trustGrossIncome, '');
            } else {
                html += '<div style="color:#555;margin-left:12px;">No trust income' + (d.condo_value <= 0 ? ' (condo sold)' : '') + '</div>';
            }

            // Trust deductions
            html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">Trust Deductions:</div>';
            var condoBasis = sc.condo_original_basis || 400000;
            var condoDepr = d.condo_value > 0 ? (condoBasis * 0.80 / 27.5) : 0;
            var condoExpenses = (exp.condo_property_tax || 0) + (exp.condo_hoa || 0) + (exp.condo_insurance || 0) + (exp.condo_maintenance || 0) + (exp.management_fee || 0);
            var mortgageInterest = (exp.primary_mortgage_interest || 0) + (exp.condo_mortgage_interest || 0);
            var primaryCarrying = 0;
            if (d.in_memory_care) {
                primaryCarrying = (exp.primary_house_taxes || 0) + (exp.primary_house_insurance || 0) + (exp.primary_house_maintenance || 0) + (exp.primary_house_utilities || 0);
            }
            var roommateDepr = d.roommate_depreciation || 0;
            var totalDeductions = condoDepr + condoExpenses + mortgageInterest + primaryCarrying + roommateDepr;

            if (condoDepr) html += line('  condo_depreciation', condoDepr, condoBasis + ' basis * 80% / 27.5yr');
            if (condoExpenses) html += line('  condo_expenses', condoExpenses, 'Tax, HOA, ins, maint, mgmt fee');
            if (mortgageInterest) html += line('  mortgage_interest', mortgageInterest, 'Primary IO' + (exp.condo_mortgage_interest ? ' + condo interest' : ''));
            if (primaryCarrying) html += line('  primary_carrying', primaryCarrying, 'After Person A moves to MC');
            if (roommateDepr) html += line('  roommate_depreciation', roommateDepr, 'Rented portion of primary house');
            html += line('  total_deductions', totalDeductions, '');

            // Taxable income (from engine calculation)
            var trustTaxable = d.trust_taxable_income || (trustGrossIncome - totalDeductions);
            html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">Trust Taxable Income (Form 1041 / OR-41):</div>';
            html += '<div><span class="debug-key">  taxable_income</span>: <span class="debug-val" style="color:' + (trustTaxable < 0 ? '#e74c3c' : '#27ae60') + ';">' + fmt(d.trust_gross_income || trustGrossIncome) + ' - ' + fmt(d.trust_total_deductions || totalDeductions) + ' - $100 exemption = ' + fmt(trustTaxable) + '</span>' +
                (trustTaxable < 0 ? ' <span style="color:#666;font-size:11px;">— loss carried forward</span>' : '') + '</div>';

            // Tax liability (from engine — real 1041 brackets)
            var fedTax = d.trust_federal_tax || 0;
            var orTax = d.trust_oregon_tax || 0;
            var totalTrustTax = d.trust_total_tax || 0;
            html += line('  federal_tax (1041)', fedTax, trustTaxable <= 0 ? 'No tax — deductions exceed income' : '10%/$3.3k, 24%/$11.7k, 35%/$16k, 37%+');
            html += line('  oregon_tax (OR-41)', orTax, trustTaxable <= 0 ? '' : '4.75%/$4.4k, 6.75%/$11k, 8.75%/$125k, 9.9%+');
            html += line('  total_trust_tax', totalTrustTax, '');

            html += '</div>';
        }

        // === MAPT Trust ===
        if (isMAPT) {
            html += sectionStart('MAPT Trust');
            if (d.mapt_checking_open !== undefined) html += line('mapt_checking_open', d.mapt_checking_open, 'MAPT checking (start of year)');
            if (d.rental_to_trust) html += line('rental_to_trust', d.rental_to_trust, 'Condo rental income routed to trust');
            if (d.roommate_net_to_trust) html += line('roommate_net_to_trust', d.roommate_net_to_trust, 'Net roommate income to trust');
            if (d.mapt_checking_spent) html += line('mapt_checking_spent', d.mapt_checking_spent, 'Spent from MAPT checking');
            if (d.mapt_trust_shortfall) html += line('mapt_trust_shortfall', d.mapt_trust_shortfall, 'SHORTFALL — unfunded trust expense gap');
            html += '';
            if (d.snt_funded || d.snt_funded_gross) {
                if (d.snt_funded_gross) html += line('snt_liquidation_gross', d.snt_funded_gross, 'Total liquidation (taxable as ordinary income)');
                if (d.snt_funded_liquid) html += line('  liquid_balances', d.snt_funded_liquid, 'IRA + savings balances');
                if (d.snt_funded_annuity_surrender) html += line('  annuity_surrender', d.snt_funded_annuity_surrender, 'Remaining annuity payments at 85% (15% surrender loss)');
                if (d.liquidation_tax_withholding) {
                    html += line('  tax_withholding', d.liquidation_tax_withholding, 'Split Dec/Jan to minimize bracket impact');
                    html += '<div style="color:#666;font-size:11px;margin-left:12px;">Year 1 (Dec): ' + fmt(d.liquidation_tax_year1) + ' | Year 2 (Jan): ' + fmt(d.liquidation_tax_year2) + '</div>';
                }
                if (d.snt_funded_mortgage_payoff) html += line('  condo_mortgage_payoff', d.snt_funded_mortgage_payoff, 'SNT condo mortgage paid off at Medicaid activation');
                html += line('snt_funded (net)', d.snt_funded, 'Net into SNT after tax + mortgage payoff');
            }
            if (d.snt_condo_mortgage) html += line('snt_condo_mortgage', d.snt_condo_mortgage, 'Condo mortgage paid from SNT (C2)');
            html += line('snt_balance [EOY]', d.snt_balance, 'Special Needs Trust balance');
            html += line('trust_protected', d.trust_protected, 'Assets protected (5yr lookback clear)');
            html += '<div style="border-top:1px solid #444;margin-top:4px;padding-top:4px;">';
            html += line('trust_balance [EOY]', d.trust_balance, 'MAPT checking account balance');
            html += '</div>';
            html += '</div>';
        }

        // === Medicaid ===
        if (d.medicaid_active || d.medicaid_invoked || d.medicaid_pre_liquidation || d.ss_seized) {
            html += sectionStart('Medicaid');
            if (d.medicaid_invoked) html += line('medicaid_invoked', true, 'Medicaid was invoked this year');
            if (d.medicaid_active) html += line('medicaid_active', true, 'Medicaid is covering memory care');
            if (d.medicaid_pre_liquidation) html += line('pre_liquidation', true, 'Pre-Medicaid liquidation flagged');
            if (d.ss_seized) html += line('ss_seized', true, 'Social Security seized as patient pay');
            if (d.memory_care_medicaid) html += line('memory_care_medicaid', true, 'Memory care paid by Medicaid');
            html += '</div>';
        }

        // === Budget & Liquid ===
        html += sectionStart('Budget & Liquid');
        html += line(eKey('personal_budget'), d.personal_budget, 'Personal budget target (slider)');
        if (exp.lifestyle !== undefined) html += line('lifestyle_actual', exp.lifestyle, 'TODO - Personal Budget: What is Person A spending this on?');
        if (d.sdira_distributions) html += line('sdira_distributions', d.sdira_distributions, 'Withdrawn from SDIRA Checking');
        if (d.ltc_savings_spent) html += line('ltc_savings_spent', d.ltc_savings_spent, 'Cash spent from LTC savings');
        html += line('in_memory_care', d.in_memory_care, d.in_memory_care ? 'Person A is in memory care facility' : '');
        html += line('liquid_assets_open', d.liquid_assets_open, 'Liquid assets (start of year)');
        html += line('liquid_assets_total [EOY]', d.liquid_assets_total, 'Liquid assets after all transactions');
        html += line('annuity_payments', d.annuity_payments, 'Annuity SMA payments deposited to SDIRA by end of year');
        if (d.strategy) html += line('strategy', d.strategy, 'Funding strategy used');
        html += '</div>';

        // === Sibling Equity Ledger ===
        if (d.ledger) {
            var L = d.ledger;
            html += sectionStart('Sibling Equity Ledger (cumulative through ' + d.year + ')');

            // Find Arbor Roses condo sale from projection data
            var condoSaleData = null;
            if (window.projectionData) {
                condoSaleData = window.projectionData.find(function(y) { return y.condo_sold; });
            }
            if (condoSaleData && condoSaleData.condo_sale_proceeds) {
                var netProceeds = condoSaleData.condo_sale_proceeds;
                var closingCosts = 20000;
                var salePrice = netProceeds + closingCosts;
                html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">C3 Arbor Roses Liquidation (' + condoSaleData.year + '):</div>';
                html += line('  sale price', salePrice, '');
                html += calc('  net proceeds', fmt(salePrice) + ' - ' + fmt(closingCosts) + ' closing costs & deferred maint', fmt(netProceeds));
            }

            html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">C2 Early Inheritance:</div>';
            html += line('  SNT condo purchase', L.snt_condo_purchase, 'Mortgage (' + fmt(L.snt_condo_purchase + 30000) + ') - $30k closing/deferred maint/$10k SNT');
            html += line('  SNT top-up', L.snt_initial_contribution, 'Balance for fallback & SSA administration shenanigans');
            if (L.snt_ira_liquidation) html += line('  IRA/annuity → SNT', L.snt_ira_liquidation, 'Liquid balances + annuity surrender (85%) - tax withholding, at Medicaid trigger');
            var c2Total = L.snt_condo_purchase + L.snt_initial_contribution + L.snt_ira_liquidation;
            html += line('  SNT condo total cost', c2Total, '');
            html += '<div style="color:#666;font-size:11px;margin-left:12px;">Remaining net proceeds deposited to MAPT account</div>';

            html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">MAPT Income → Shared Expenses:</div>';
            html += line('  Rental → condo expenses', L.cum_rental_to_condo_expenses, 'Tax, HOA, ins, maint, mgmt');
            html += line('  Rental → primary mortgage IO', L.cum_rental_to_primary_mortgage, 'Interest-only payments');
            if (L.cum_rental_to_primary_house) html += line('  Rental → primary house (post-MC)', L.cum_rental_to_primary_house, 'Tax, ins, maint, utils after Person A → MC');
            if (roommateOn) {
                if (L.cum_roommate_to_primary) {
                    html += line('  Roommate → primary house', L.cum_roommate_to_primary, '$' + (sc.roommate_monthly || 1100) + '/mo post-MC roommate income');
                } else {
                    html += '<div style="color:#555;margin-left:12px;">Roommate income: starts at memory care</div>';
                }
            }
            var sharedTotal = L.cum_rental_to_condo_expenses + L.cum_rental_to_primary_mortgage + L.cum_rental_to_primary_house + L.cum_roommate_to_primary;
            html += line('  Total shared expenses', sharedTotal, 'Benefits all siblings equally');

            html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">C2 Equity Building:</div>';
            html += line('  Condo mortgage P&I paid', L.cum_condo_mortgage_paid, 'Provides outlet for tax-free relief of expenses from SNT or C2 back to Person A');

            html += '<div style="color:#aac8e4;font-weight:600;margin-top:4px;">SNT → MAPT Backup:</div>';
            if (L.cum_snt_mapt_backup) {
                html += line('  SNT backup for MAPT', L.cum_snt_mapt_backup, 'SNT funds used to cover MAPT shortfall');
                html += '<div style="color:#666;font-size:11px;margin-left:12px;">Protects all siblings\' inheritance by keeping properties lien-free</div>';
            } else {
                html += '<div style="color:#27ae60;margin-left:12px;">$0 — ' + (roommateOn ? 'roommate income covers MAPT expenses' : 'MAPT checking sufficient') + '</div>';
            }

            html += '</div>';
        }

        // === Annuity Schedule ===
        var instruments = window.instrumentData;
        if (instruments && instruments.length > 0) {
            html += sectionStart('Annuity Schedule (remaining from ' + d.year + ')');
            instruments.forEach(function(inst) {
                if (!inst.payment_end_date || !inst.monthly_payment) return;
                var endYear = parseInt(inst.payment_end_date.substring(0, 4));
                var endMonth = parseInt(inst.payment_end_date.substring(5, 7));
                if (endYear < d.year) return; // already ended
                var remainingYears = endYear - d.year;
                var remainingMonths = (endYear - d.year) * 12 + endMonth;
                var annual = inst.monthly_payment * 12;
                var timeLeft = remainingYears + 'yr';
                if (remainingYears < 10) {
                    timeLeft = remainingMonths + 'mo (' + remainingYears + 'yr)';
                }
                html += '<div><span class="debug-key">' + inst.id + '</span> (' + inst.type + '): ' +
                    '<span class="debug-val">' + fmtMo(annual) + '</span>' +
                    ', ends ' + inst.payment_end_date.substring(0, 7) + ' (' + timeLeft + ' left)</div>';
            });
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    // Click handler
    $(document).on('click', '.debug-btn', function() {
        var year = parseInt($(this).attr('data-year'));
        if (!window.projectionData) return;
        var data = window.projectionData.find(function(y) { return y.year === year; });
        if (!data) return;
        var html = renderYearData(data);
        var sidebar = document.getElementById('tooltip-sidebar');
        var overlay = document.getElementById('tooltip-sidebar-overlay');
        var content = document.getElementById('tooltip-sidebar-content');
        var title = document.getElementById('tooltip-sidebar-title');
        if (sidebar && content) {
            content.innerHTML = html;
            if (title) title.textContent = data.year + ' Yearly Values & Calculations';
            sidebar.classList.add('active');
            if (overlay) overlay.classList.add('active');
        }
    });

})();

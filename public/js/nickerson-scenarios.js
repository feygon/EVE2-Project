/**
 * Nickerson BurnRate Scenarios - Client-side interactions
 */

(function() {
    'use strict';

    // Scenario mapping: disposition -> scenario ID
    // LTC trigger year is dynamically updated via slider
    const scenarioMap = {
        baseline: 'ScA_Baseline',
        rental: 'ScA_Rental',
        mapt: 'ScA_MAPT'
    };

    let currentTriggerYear = 2028;

    // Initialize on page load
    $(document).ready(function() {
        initializeSidebar();
        initializeTriggerSelector();
        initializeCards();
        initializeSliders();
        initializeDetailLinks();
        loadInitialMetrics();
    });

    /**
     * Initialize parameter sidebar toggle
     */
    function initializeSidebar() {
        // Overview: open by default
        if (window.sidebarDefaultOpen) {
            $('#paramSidebar').addClass('open');
            $('#sidebarToggle').addClass('shifted');
        }

        $('#sidebarToggle').on('click', function() {
            if ($('#paramSidebar').hasClass('open')) {
                $('#paramSidebar').removeClass('open');
                $(this).removeClass('shifted');
            } else {
                $('#paramSidebar').addClass('open');
                $(this).addClass('shifted');
            }
        });

        $('#sidebarClose').on('click', function() {
            $('#paramSidebar').removeClass('open');
            $('#sidebarToggle').removeClass('shifted');
        });

        // Close on Escape key
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && $('#paramSidebar').hasClass('open')) {
                $('#paramSidebar').removeClass('open');
                $('#sidebarToggle').removeClass('shifted');
            }
        });
    }

    /**
     * Initialize LTC trigger year selector buttons
     */
    function initializeTriggerSelector() {
        $('.trigger-btn').on('click', function() {
            const year = parseInt($(this).data('year'));
            if (year !== currentTriggerYear) {
                currentTriggerYear = year;
                $('.trigger-btn').removeClass('active');
                $(this).addClass('active');
                updateCardsForTriggerYear(year);
            }
        });
    }

    /**
     * Update cards to show scenarios for selected trigger year
     */
    function updateCardsForTriggerYear(year) {
        console.log('[Nickerson] Updating cards for trigger year:', year);

        // Update all scenarios to the new trigger year
        const scenarioIds = Object.values(scenarioMap);
        const updatePromises = scenarioIds.map(scenarioId => {
            return $.ajax({
                url: '/Nickerson/scenario/' + scenarioId + '/update-ltc',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ ltcTrigger: year }),
                xhrFields: { withCredentials: true }
            });
        });

        // Wait for all updates to complete
        Promise.all(updatePromises).then(() => {
            // Update card UI
            $('.scenario-card').each(function() {
                const $card = $(this);
                const disposition = $card.data('disposition');
                const scenarioId = scenarioMap[disposition];

                console.log('[Nickerson] Setting card', disposition, 'to scenario', scenarioId);
                $card.data('scenario-id', scenarioId);

                // Update LTC trigger slider value
                $card.find('.ltc-slider').val(year);
                $card.find('.ltc-value').text(year);
            });

            // Load metrics for updated scenarios
            loadMetricsForAllCards();
        });
    }

    /**
     * Update all scenarios with new memory care year
     */
    function updateAllScenariosMemoryCare(year) {
        console.log('[Nickerson] Updating all scenarios memory care year:', year);

        // Update all scenarios to the new year
        const scenarioIds = Object.values(scenarioMap);
        const updatePromises = scenarioIds.map(scenarioId => {
            return $.ajax({
                url: '/Nickerson/scenario/' + scenarioId + '/update-memory-care',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ memoryCareYear: year }),
                xhrFields: { withCredentials: true }
            });
        });

        // Wait for all updates to complete
        Promise.all(updatePromises).then(() => {
            console.log('[Nickerson] Memory care year updated, reloading metrics');
            loadMetricsForAllCards();
        });
    }

    /**
     * Update all scenarios with new ManagedIRA starting balance
     */
    function updateAllScenariosManagedIra(amount) {
        console.log('[Nickerson] Updating all scenarios ManagedIRA start:', amount);

        // Update all scenarios to the new amount
        const scenarioIds = Object.values(scenarioMap);
        const updatePromises = scenarioIds.map(scenarioId => {
            return $.ajax({
                url: '/Nickerson/scenario/' + scenarioId + '/update-managed-ira',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ managedIraStart: amount }),
                xhrFields: { withCredentials: true }
            });
        });

        // Wait for all updates to complete
        Promise.all(updatePromises).then(() => {
            console.log('[Nickerson] ManagedIRA start updated, reloading metrics');
            loadMetricsForAllCards();
        });
    }

    /**
     * Update all scenarios with a parameter value
     */
    function updateAllScenariosParameter(paramName, paramValue) {
        console.log('[Nickerson] Updating all scenarios', paramName, ':', paramValue);

        const scenarioIds = Object.values(scenarioMap);
        const updatePromises = scenarioIds.map(scenarioId => {
            return $.ajax({
                url: '/Nickerson/scenario/' + scenarioId + '/update-parameter',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ paramName: paramName, paramValue: paramValue }),
                xhrFields: { withCredentials: true }
            });
        });

        Promise.all(updatePromises).then(() => {
            console.log('[Nickerson] Parameter', paramName, 'updated, reloading metrics');
            loadMetricsForAllCards();
        });
    }

    /**
     * Update all scenarios with new year of passing
     */
    function updateAllScenariosYearOfPassing(year) {
        console.log('[Nickerson] Updating all scenarios year of passing:', year);

        // Update all scenarios to the new year
        const scenarioIds = Object.values(scenarioMap);
        const updatePromises = scenarioIds.map(scenarioId => {
            return $.ajax({
                url: '/Nickerson/scenario/' + scenarioId + '/update-year-of-passing',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ yearOfPassing: year }),
                xhrFields: { withCredentials: true }
            });
        });

        // Wait for all updates to complete
        Promise.all(updatePromises).then(() => {
            console.log('[Nickerson] Year of passing updated, reloading metrics');
            loadMetricsForAllCards();
        });
    }

    /**
     * Update memory care slider range based on LTC trigger year and year of passing
     */
    function updateMemoryCareRange(triggerYear, yearOfPassing) {
        if (!yearOfPassing) {
            yearOfPassing = parseInt($('.year-of-passing-slider').first().val()) || 2040;
        }

        $('.memory-care-slider').each(function() {
            const $slider = $(this);
            const currentValue = parseInt($slider.val());

            // Update min and max attributes to year values
            $slider.attr('min', triggerYear);
            $slider.attr('max', yearOfPassing);

            // If current value is outside the new range, constrain it
            let newValue = currentValue;
            if (currentValue < triggerYear) {
                newValue = triggerYear;
            } else if (currentValue > yearOfPassing) {
                newValue = yearOfPassing;
            }

            if (newValue !== currentValue) {
                $slider.val(newValue);
                $slider.siblings('.memory-care-value').text(newValue);
            }
        });

        console.log('[Nickerson] Memory care range updated to', triggerYear, '-', yearOfPassing);
    }

    /**
     * Initialize scenario cards with proper scenario IDs
     */
    function initializeCards() {
        console.log('[Nickerson] Initializing cards for trigger year:', currentTriggerYear);
        updateMemoryCareRange(currentTriggerYear);  // Set initial max value
        updateCardsForTriggerYear(currentTriggerYear);
    }

    /**
     * Initialize detail links to navigate to scenario detail pages
     */
    function initializeDetailLinks() {
        $('.btn-details').on('click', function(e) {
            e.preventDefault();
            const $card = $(this).closest('.scenario-card');
            const scenarioId = $card.data('scenario-id');

            if (scenarioId) {
                const dest = '/Nickerson/scenario/' + scenarioId;

                // Animate sidebar closed so user sees it collapse (teaches affordance)
                if ($('#paramSidebar').hasClass('open')) {
                    $('#paramSidebar').removeClass('open');
                    $('#sidebarToggle').removeClass('shifted');
                    // Navigate after the CSS transition completes (300ms)
                    setTimeout(function() { window.location.href = dest; }, 350);
                } else {
                    window.location.href = dest;
                }
            } else {
                console.warn('[Nickerson] No scenario ID found for detail link');
            }
        });
    }

    /**
     * Update timeline summary text based on current slider values
     */
    function updateTimelineSummary() {
        const ltcYear = parseInt($('.ltc-slider').first().val()) || 2028;
        const memoryCareYear = parseInt($('.memory-care-slider').first().val()) || 2031;
        const passingYear = parseInt($('.year-of-passing-slider').first().val()) || 2040;

        const summaryText = `LTC insurance payout in ${ltcYear}, Memory Care starts ${memoryCareYear}, Passing in ${passingYear}`;
        $('.timeline-text').text(summaryText);
    }

    /**
     * Initialize all slider interactions
     */
    function initializeSliders() {
        // LTC trigger sliders (synchronized across all cards)
        $('.ltc-slider').on('input', function() {
            const newYear = parseInt($(this).val());
            const yearOfPassing = parseInt($('.year-of-passing-slider').first().val()) || 2040;

            // Constrain to year of passing
            const constrainedYear = Math.min(newYear, yearOfPassing);

            // Update display value for all sliders
            $('.ltc-slider').val(constrainedYear);
            $('.ltc-value').text(constrainedYear);

            // Update timeline summary
            updateTimelineSummary();

            // Update memory care slider max based on new trigger year
            updateMemoryCareRange(constrainedYear, yearOfPassing);

            // Debounced update to avoid too many API calls while dragging
            clearTimeout(window.ltcSliderUpdateTimer);
            window.ltcSliderUpdateTimer = setTimeout(function() {
                currentTriggerYear = constrainedYear;
                updateCardsForTriggerYear(constrainedYear);
            }, 300);  // 300ms debounce
        });

        // Memory care year sliders (synchronized across all cards)
        $('.memory-care-slider').on('input', function() {
            const year = parseInt($(this).val());

            // Update display value for all sliders
            $('.memory-care-slider').val(year);
            $('.memory-care-value').text(year);

            // Update timeline summary
            updateTimelineSummary();

            // Debounced update to avoid too many API calls while dragging
            clearTimeout(window.memoryCareSliderUpdateTimer);
            window.memoryCareSliderUpdateTimer = setTimeout(function() {
                updateAllScenariosMemoryCare(year);
            }, 300);  // 300ms debounce
        });

        // Year of passing sliders (synchronized across all cards)
        $('.year-of-passing-slider').on('input', function() {
            const newYear = parseInt($(this).val());

            // Update display value for all sliders
            $('.year-of-passing-slider').val(newYear);
            $('.year-of-passing-value').text(newYear);

            // Update timeline summary
            updateTimelineSummary();

            // Constrain LTC trigger year if needed
            const currentLtcTrigger = parseInt($('.ltc-slider').first().val());
            if (currentLtcTrigger > newYear) {
                $('.ltc-slider').val(newYear);
                $('.ltc-value').text(newYear);
                currentTriggerYear = newYear;
            }

            // Update memory care max based on new year of passing
            updateMemoryCareRange(currentLtcTrigger, newYear);

            // Debounced update to avoid too many API calls while dragging
            clearTimeout(window.yearOfPassingSliderUpdateTimer);
            window.yearOfPassingSliderUpdateTimer = setTimeout(function() {
                updateAllScenariosYearOfPassing(newYear);
            }, 300);  // 300ms debounce
        });

        // Sell-condo checkbox (sidebar — updates Rental and MAPT, not Baseline)
        $('.sell-condo-toggle').on('change', function() {
            const checked = this.checked ? 1 : 0;
            const nonBaselineIds = ['ScA_Rental', 'ScA_MAPT'];

            const updates = nonBaselineIds.map(id => $.ajax({
                url: '/Nickerson/scenario/' + id + '/update-parameter',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ paramName: 'sell_condo_upfront', paramValue: checked }),
                xhrFields: { withCredentials: true }
            }));

            Promise.all(updates).then(() => {
                loadMetricsForAllCards();
            });
        });

        // Roommate checkbox (MAPT only)
        $('#sidebar-roommate').on('change', function() {
            const checked = this.checked ? 1 : 0;
            if (checked) {
                $('.roommate-amount').show();
            } else {
                $('.roommate-amount').hide();
            }
            $.ajax({
                url: '/Nickerson/scenario/ScA_MAPT/update-parameter',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ paramName: 'roommate_enabled', paramValue: checked }),
                xhrFields: { withCredentials: true }
            }).then(() => { loadMetricsForAllCards(); });
        });

        // Parameter sliders (sidebar — single instance per param)
        $('.param-slider').on('input', function() {
            const param = $(this).data('param');
            const value = parseFloat($(this).val());

            // Update display value
            updateParamDisplay($(this), param, value);

            // Update backend for all parameters
            const paramMap = {
                'ira_growth': 'ira_growth',
                'managed_ira_start': 'managed_ira_start',
                'lifestyle': 'lifestyle_annual',
                'primary_appreciation': 'primary_appreciation',
                'condo_appreciation': 'condo_appreciation',
                'memory_care_inflation': 'memory_care_inflation',
                'management_fee': 'management_fee',
                'rental_income': 'rental_income_monthly',
                'total_mortgage_amount': 'total_mortgage_amount',
                'mortgage_split_pct': 'mortgage_split_pct',
                'primary_mortgage_rate': 'primary_mortgage_rate',
                'condo_mortgage_rate': 'condo_mortgage_rate',
                'heloc_rate': 'heloc_rate',
                'medical_base_monthly': 'medical_base_monthly',
                'memory_care_cost': 'memory_care_cost',
                'condo_maintenance': 'condo_maintenance',
                'roommate_monthly': 'roommate_monthly',
                'primary_house_value': 'primary_house_value',
                'condo_value': 'condo_value',
                'rental_increase_rate': 'rental_increase_rate'
            };

            // Percentage parameters: slider value (6.0) → decimal (0.06) for backend
            const percentageParams = ['ira_growth', 'primary_appreciation', 'condo_appreciation',
                                       'memory_care_inflation', 'management_fee',
                                       'primary_mortgage_rate', 'condo_mortgage_rate', 'heloc_rate',
                                       'mortgage_split_pct', 'rental_increase_rate'];

            if (paramMap[param]) {
                clearTimeout(window.paramSliderUpdateTimer);
                window.paramSliderUpdateTimer = setTimeout(function() {
                    // Convert percentage to decimal if needed
                    const backendValue = percentageParams.includes(param) ? value / 100 : value;
                    updateAllScenariosParameter(paramMap[param], backendValue);
                }, 300);  // 300ms debounce
            }
        });
    }

    /**
     * Update parameter display value based on type
     */
    function updateParamDisplay($slider, param, value) {
        const $display = $slider.siblings('.param-value');
        let displayText = '';

        if (param === 'lifestyle') {
            displayText = '$' + formatNumber(value) + '/yr';
        } else if (param === 'rental_income') {
            displayText = '$' + formatNumber(value) + '/mo';
        } else if (param === 'medical_base_monthly' || param === 'roommate_monthly') {
            displayText = '$' + formatNumber(value) + '/mo';
        } else if (param === 'managed_ira_start' || param === 'total_mortgage_amount' || param === 'primary_house_value' || param === 'condo_value') {
            displayText = '$' + formatNumber(value);
        } else if (param === 'memory_care_cost' || param === 'condo_maintenance') {
            displayText = '$' + formatNumber(value) + '/yr';
        } else if (param === 'mortgage_split_pct') {
            displayText = value + '% / ' + (100 - value) + '%';
        } else {
            displayText = value.toFixed(1) + '%';
        }

        $display.text(displayText);
    }

    /**
     * Initialize slider values from DB scenario data (injected as window.scenarioData)
     * Fixes: sliders resetting to hardcoded HTML defaults on page load
     */
    function initializeSliderValues() {
        if (!window.scenarioData) return;

        // Use first scenario's values (sliders are synced across all cards)
        const firstId = Object.keys(window.scenarioData)[0];
        if (!firstId) return;
        const data = window.scenarioData[firstId];

        // Map: data-param attribute → { dbKey, toSlider transform }
        // Percentage params are stored as decimals (0.06) but sliders use display values (6.0)
        const paramInit = {
            'ira_growth':              { val: data.ira_growth * 100 },
            'managed_ira_start':       { val: data.managed_ira_start },
            'lifestyle':               { val: data.lifestyle_annual },
            'primary_appreciation':    { val: data.primary_appreciation * 100 },
            'condo_appreciation':      { val: data.condo_appreciation * 100 },
            'memory_care_inflation':   { val: data.memory_care_inflation * 100 },
            'management_fee':          { val: data.management_fee * 100 },
            'rental_income':           { val: data.rental_income_monthly },
            'heloc_rate':              { val: data.heloc_rate * 100 },
            'medical_base_monthly':    { val: data.medical_base_monthly },
            'memory_care_cost':        { val: data.memory_care_cost },
            'total_mortgage_amount':   { val: data.total_mortgage_amount },
            'mortgage_split_pct':      { val: data.mortgage_split_pct * 100 },
            'primary_mortgage_rate':   { val: data.primary_mortgage_rate * 100 },
            'condo_mortgage_rate':       { val: data.condo_mortgage_rate * 100 },
            'condo_maintenance':       { val: data.condo_maintenance },
            'primary_house_value':     { val: data.primary_house_value },
            'condo_value':             { val: data.condo_value },
            'rental_increase_rate':    { val: data.rental_increase_rate * 100 }
        };

        Object.keys(paramInit).forEach(function(param) {
            var val = paramInit[param].val;
            if (val === undefined || val === null) return;
            $('.param-slider[data-param="' + param + '"]').each(function() {
                $(this).val(val);
                updateParamDisplay($(this), param, val);
            });
        });

        // Timeline sliders
        if (data.ltc_trigger_year) {
            $('.ltc-slider').val(data.ltc_trigger_year);
            $('.ltc-slider').siblings('.ltc-value, .trigger-value').text(data.ltc_trigger_year);
        }
        if (data.memory_care_year) {
            $('.memory-care-slider').val(data.memory_care_year);
            $('.memory-care-slider').siblings('.memory-care-value').text(data.memory_care_year);
        }
        if (data.year_of_passing) {
            $('.year-of-passing-slider').val(data.year_of_passing);
            $('.year-of-passing-slider').siblings('.year-of-passing-value, .passing-value').text(data.year_of_passing);
        }

        // Sell-condo checkbox (sidebar — init from Rental scenario state)
        var rentalData = window.scenarioData['ScA_Rental'];
        if (rentalData) {
            $('#sidebar-sell-condo').prop('checked', rentalData.sell_condo_upfront === 1);
        }

        // Roommate checkbox (sidebar — init from MAPT scenario state)
        var maptData = window.scenarioData['ScA_MAPT'];
        if (maptData) {
            $('#sidebar-roommate').prop('checked', maptData.roommate_enabled === 1);
            if (maptData.roommate_enabled === 1) {
                $('.roommate-amount').show();
            }
            if (maptData.roommate_monthly) {
                $('.param-slider[data-param="roommate_monthly"]').val(maptData.roommate_monthly);
                updateParamDisplay($('.param-slider[data-param="roommate_monthly"]'), 'roommate_monthly', maptData.roommate_monthly);
            }
        }
    }

    /**
     * Load initial metrics for all cards
     */
    function loadInitialMetrics() {
        initializeSliderValues();
        loadMetricsForAllCards();
    }

    /**
     * Load metrics for all visible cards
     */
    function loadMetricsForAllCards() {
        const scenarioIds = [];

        $('.scenario-card').each(function() {
            const scenarioId = $(this).data('scenario-id');
            console.log('[Nickerson] Card scenario ID:', scenarioId);
            if (scenarioId) {
                scenarioIds.push(scenarioId);
            }
        });

        console.log('[Nickerson] Loading metrics for scenarios:', scenarioIds);

        if (scenarioIds.length === 0) {
            console.warn('[Nickerson] No scenario IDs found, skipping metrics load');
            return;
        }

        // Show loading state
        $('.scenario-card').addClass('loading');

        $.ajax({
            url: '/Nickerson/scenarios/metrics',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ scenarioIds: scenarioIds }),
            xhrFields: {
                withCredentials: true
            },
            success: function(response) {
                console.log('[Nickerson] Metrics response:', response);
                console.log('[Nickerson] Response.success:', response.success);
                console.log('[Nickerson] Response.metrics:', response.metrics);

                if (response.success) {
                    console.log('[Nickerson] Success is true, updating cards...');

                    // Get first scenario's configuration to sync sliders
                    const firstScenarioId = Object.keys(response.metrics)[0];
                    if (firstScenarioId && response.metrics[firstScenarioId]) {
                        const config = response.metrics[firstScenarioId];

                        // Update year of passing slider
                        if (config.year_of_passing) {
                            $('.year-of-passing-slider').val(config.year_of_passing);
                            $('.year-of-passing-value').text(config.year_of_passing);
                        }

                        // Update memory care year slider
                        if (config.memory_care_year !== undefined) {
                            $('.memory-care-slider').val(config.memory_care_year);
                            $('.memory-care-value').text(config.memory_care_year);
                        }

                        // Update memory care slider range based on loaded values
                        if (config.ltc_trigger_year && config.year_of_passing) {
                            updateMemoryCareRange(config.ltc_trigger_year, config.year_of_passing);
                        }
                    }

                    // Update each card's metrics
                    $('.scenario-card').each(function() {
                        const scenarioId = $(this).data('scenario-id');
                        console.log('[Nickerson] Checking scenario:', scenarioId);
                        console.log('[Nickerson] Metrics for this scenario:', response.metrics[scenarioId]);
                        if (response.metrics[scenarioId]) {
                            console.log('[Nickerson] Calling updateCardMetrics for', scenarioId);
                            updateCardMetrics($(this), response.metrics[scenarioId]);
                        } else {
                            console.warn('[Nickerson] No metrics found for', scenarioId);
                        }
                    });
                } else {
                    console.error('[Nickerson] Response.success was false');
                }
                $('.scenario-card').removeClass('loading');
            },
            error: function(xhr, status, error) {
                console.error('[Nickerson] Error loading metrics:', error);
                console.error('[Nickerson] XHR:', xhr);
                $('.scenario-card').removeClass('loading');
            }
        });
    }

    /**
     * Update LTC trigger year for a scenario
     */
    function updateScenarioLTC($card, scenarioId, newYear) {
        $card.addClass('loading');

        $.ajax({
            url: '/Nickerson/scenario/' + scenarioId + '/update-ltc',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ ltcTrigger: newYear }),
            xhrFields: {
                withCredentials: true
            },
            success: function(response) {
                if (response.success && response.metrics) {
                    updateCardMetrics($card, response.metrics);
                }
                $card.removeClass('loading');
            },
            error: function(xhr, status, error) {
                console.error('Error updating LTC trigger:', error);
                $card.removeClass('loading');
            }
        });
    }

    /**
     * Update card metrics display
     */
    function updateCardMetrics($card, metrics) {
        console.log('[Nickerson] Updating card metrics:', metrics);
        console.log('[Nickerson] Card disposition:', $card.data('disposition'));

        // Update liquid assets values
        $card.find('.liquid-assets-start').text(formatCurrency(metrics.liquid_assets_start));
        // Final: show depletion year if hit $0
        if (metrics.liquid_assets_final <= 0 && metrics.liquid_assets_min_year) {
            $card.find('.liquid-assets-final').text('$0 (' + metrics.liquid_assets_min_year + ')');
        } else {
            $card.find('.liquid-assets-final').text(formatCurrency(metrics.liquid_assets_final));
        }

        // Update IRA values
        $card.find('.ira-start').text(formatCurrency(metrics.ira_start));
        // Final: show depletion year if hit $0
        if (metrics.ira_final <= 0 && metrics.ira_min_year) {
            $card.find('.ira-final').text('$0 (' + metrics.ira_min_year + ')');
        } else {
            $card.find('.ira-final').text(formatCurrency(metrics.ira_final));
        }

        // Update LTC total
        $card.find('.ltc-total').text(formatCurrency(metrics.ltc_total));

        // MAPT Trust balance (only for MAPT scenario)
        if (metrics.trust_balance_final !== undefined && metrics.trust_balance_final !== null) {
            var trustTotal = (metrics.trust_balance_final || 0) + (metrics.snt_balance_final || 0);
            var trustText = formatCurrency(trustTotal);
            if (trustTotal <= 0 && metrics.trust_exhausted_year) {
                trustText = '$0 (' + metrics.trust_exhausted_year + ')';
            }
            $card.find('.trust-balance-final').text(trustText);
            $card.find('.mapt-only').show();
        }

        // Update final real estate values (multi-line display)
        let realEstateLines = [];
        realEstateLines.push('Primary: ' + formatCurrency(metrics.house_value_final));

        if (metrics.condo_value_final > 0) {
            realEstateLines.push('ArborRoses: ' + formatCurrency(metrics.condo_value_final));
        } else if (metrics.condo_sale_year) {
            realEstateLines.push('ArborRoses: $0 (sold ' + metrics.condo_sale_year + ')');
        } else {
            realEstateLines.push('ArborRoses: $0');
        }

        // Join with line breaks and set HTML
        $card.find('.real-estate-final').html(realEstateLines.join('<br>'));

        // Update real estate liquidation (multi-line display)
        let realEstateLiqLines = [];
        let realEstateTooltipParts = [];

        // Show condo sale if it happened
        if (metrics.condo_sale_year) {
            realEstateLiqLines.push('Condo sold: ' + formatCurrency(metrics.condo_sale_proceeds) + ' (' + metrics.condo_sale_year + ')');
            realEstateTooltipParts.push('Condo sold in ' + metrics.condo_sale_year + ' for ' + formatCurrency(metrics.condo_sale_proceeds));
        }

        // Show HELOC if it was used
        if (metrics.heloc_max_balance > 0) {
            realEstateLiqLines.push('HELOC: ' + formatCurrency(metrics.heloc_max_balance) + ' (' + metrics.heloc_year + ')');
            realEstateTooltipParts.push('Peak HELOC balance: ' + formatCurrency(metrics.heloc_max_balance) + ' in ' + metrics.heloc_year);
        }

        // Show final mortgage balances (dual mortgage system)
        if (metrics.primary_mortgage_final > 0 || metrics.condo_mortgage_final > 0) {
            var mortgageTotal = (metrics.primary_mortgage_final || 0) + (metrics.condo_mortgage_final || 0);
            realEstateLiqLines.push('Mortgage: ' + formatCurrency(mortgageTotal));
            realEstateTooltipParts.push('Primary (IO): ' + formatCurrency(metrics.primary_mortgage_final || 0));
            realEstateTooltipParts.push('Condo (P&I): ' + formatCurrency(metrics.condo_mortgage_final || 0));
        } else if (metrics.mortgage_final && metrics.mortgage_final > 0) {
            realEstateLiqLines.push('Mortgage: ' + formatCurrency(metrics.mortgage_final));
            realEstateTooltipParts.push('Final mortgage balance: ' + formatCurrency(metrics.mortgage_final));
        }

        // Show critical liquidation only if it's forced (not a voluntary condo sale)
        if (metrics.real_estate_liquidation_total > 0 && !metrics.condo_sale_year) {
            realEstateLiqLines.push('CRITICAL: ' + formatCurrency(metrics.real_estate_liquidation_total) + ' (' + metrics.real_estate_liquidation_year + ')');
            realEstateTooltipParts.push('WARNING: All assets exhausted. Additional liquidation needed.');
        }

        // If nothing was added, show "None"
        if (realEstateLiqLines.length === 0) {
            realEstateLiqLines.push('None');
            realEstateTooltipParts.push('No real estate liquidation needed');
        }

        const realEstateTooltip = realEstateTooltipParts.join('\n');
        $card.find('.real-estate-liquidated').html(realEstateLiqLines.join('<br>')).attr('title', realEstateTooltip);

        // Update tooltips with itemized breakdowns if available
        if (metrics.liquid_assets_breakdown) {
            $card.find('.liquid-assets-start').attr('title', formatBreakdown('Liquid Assets', metrics.liquid_assets_breakdown));
        }
        if (metrics.ira_breakdown) {
            $card.find('.ira-start').attr('title', formatBreakdown('IRA Accounts', metrics.ira_breakdown));
        }

        console.log('[Nickerson] Metrics updated');
    }

    /**
     * Format breakdown data for tooltip display
     */
    function formatBreakdown(title, breakdown) {
        if (!breakdown || Object.keys(breakdown).length === 0) return title;

        let lines = [title + ':'];
        Object.entries(breakdown).forEach(([key, value]) => {
            lines.push('  ' + key + ': ' + formatCurrency(value));
        });
        return lines.join('\n');
    }

    /**
     * Format number as currency
     */
    function formatCurrency(value) {
        if (value === undefined || value === null) return '—';

        const absValue = Math.abs(value);
        const sign = value < 0 ? '-' : '';

        if (absValue >= 1000000) {
            return sign + '$' + (absValue / 1000000).toFixed(2) + 'M';
        } else if (absValue >= 1000) {
            return sign + '$' + (absValue / 1000).toFixed(0) + 'k';
        } else {
            return sign + '$' + absValue.toFixed(0);
        }
    }

    /**
     * Format number with commas
     */
    function formatNumber(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

})();

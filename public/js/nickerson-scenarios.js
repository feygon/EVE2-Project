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
        sale: 'ScA_SNT'
    };

    let currentTriggerYear = 2028;

    // Initialize on page load
    $(document).ready(function() {
        initializeTriggerSelector();
        initializeCards();
        initializeSliders();
        initializeDetailLinks();
        loadInitialMetrics();
    });

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
                window.location.href = '/Nickerson/scenario/' + scenarioId;
            } else {
                console.warn('[Nickerson] No scenario ID found for detail link');
            }
        });
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

        // Advanced parameters toggle
        $('.param-toggle').on('change', function() {
            const $card = $(this).closest('.scenario-card');
            const $sliders = $card.find('.param-sliders');

            if (this.checked) {
                $sliders.slideDown(200);
            } else {
                $sliders.slideUp(200);
            }
        });

        // Parameter sliders (Phase 1: synchronized across all cards)
        $('.param-slider').on('input', function() {
            const param = $(this).data('param');
            const value = parseFloat($(this).val());
            const cardNum = parseInt($(this).data('card'));

            // Update display value for this card
            updateParamDisplay($(this), param, value);

            // Sync all other cards' sliders for this parameter
            $('.param-slider[data-param="' + param + '"]').not(this).each(function() {
                $(this).val(value);
                updateParamDisplay($(this), param, value);
            });

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
                'mortgage_rate': 'mortgage_rate',
                'heloc_rate': 'heloc_rate'
            };

            if (paramMap[param]) {
                clearTimeout(window.paramSliderUpdateTimer);
                window.paramSliderUpdateTimer = setTimeout(function() {
                    updateAllScenariosParameter(paramMap[param], value);
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
        } else if (param === 'managed_ira_start') {
            displayText = '$' + formatNumber(value);
        } else {
            displayText = value.toFixed(1) + '%';
        }

        $display.text(displayText);
    }

    /**
     * Load initial metrics for all cards
     */
    function loadInitialMetrics() {
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
        $card.find('.liquid-assets-min').text(formatCurrency(metrics.liquid_assets_min) +
                                              (metrics.liquid_assets_min_year ? ' (' + metrics.liquid_assets_min_year + ')' : ''));
        $card.find('.liquid-assets-final').text(formatCurrency(metrics.liquid_assets_final));

        // Update IRA values
        $card.find('.ira-start').text(formatCurrency(metrics.ira_start));
        $card.find('.ira-min').text(formatCurrency(metrics.ira_min) +
                                     (metrics.ira_min_year ? ' (' + metrics.ira_min_year + ')' : ''));
        $card.find('.ira-final').text(formatCurrency(metrics.ira_final));

        // Update LTC total
        $card.find('.ltc-total').text(formatCurrency(metrics.ltc_total));

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

        // Show final mortgage balance if any (SNT scenarios)
        if (metrics.mortgage_final && metrics.mortgage_final > 0) {
            realEstateLiqLines.push('Refi: ' + formatCurrency(metrics.mortgage_final));
            realEstateTooltipParts.push('Final mortgage balance: ' + formatCurrency(metrics.mortgage_final));
        }

        // Show critical liquidation if needed
        if (metrics.real_estate_liquidation_total > 0) {
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

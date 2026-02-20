/**
 * Nickerson BurnRate Scenarios - Client-side interactions
 */

(function() {
    'use strict';

    // Scenario mapping: year + disposition -> scenario ID
    const scenarioMap = {
        2028: {
            baseline: 'ScA_Baseline',
            rental: 'ScA_Rental',
            sale: 'ScA_SNT'  // Temporarily using SNT scenario until Sale scenario is created
        },
        2030: {
            baseline: 'ScB_Baseline',
            rental: 'ScB_Rental',
            sale: 'ScB_SNT'  // Temporarily using SNT scenario until Sale scenario is created
        },
        2032: {
            baseline: 'ScC_Baseline',
            rental: 'ScC_Rental',
            sale: 'ScC_SNT'  // Temporarily using SNT scenario until Sale scenario is created
        }
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
        $('.scenario-card').each(function() {
            const $card = $(this);
            const disposition = $card.data('disposition');
            const scenarioId = scenarioMap[year][disposition];

            console.log('[Nickerson] Setting card', disposition, 'to scenario', scenarioId);
            $card.data('scenario-id', scenarioId);

            // Update LTC trigger slider value
            $card.find('.ltc-slider').val(year);
            $card.find('.ltc-value').text(year);
        });

        // Load metrics for new scenarios
        loadMetricsForAllCards();
    }

    /**
     * Initialize scenario cards with proper scenario IDs
     */
    function initializeCards() {
        console.log('[Nickerson] Initializing cards for trigger year:', currentTriggerYear);
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
            const cardNum = parseInt($(this).data('card'));

            // Update display value for this card
            $(this).siblings('.ltc-value').text(newYear);

            // Sync all other LTC sliders
            $('.ltc-slider').not(this).val(newYear);
            $('.ltc-slider').not(this).siblings('.ltc-value').text(newYear);

            // Update scenario for this card
            const $card = $(this).closest('.scenario-card');
            const disposition = $card.data('disposition');
            const scenarioId = scenarioMap[newYear][disposition];
            $card.data('scenario-id', scenarioId);

            // Debounced metric update
            clearTimeout($card.data('updateTimer'));
            $card.data('updateTimer', setTimeout(function() {
                updateScenarioLTC($card, scenarioId, newYear);
            }, 500));
        });

        // Memory care offset sliders (synchronized across all cards)
        $('.memory-care-slider').on('input', function() {
            const offset = parseInt($(this).val());
            const yearsText = offset === 1 ? '1 year' : offset + ' years';

            // Update display value for this card
            $(this).siblings('.memory-care-value').text(yearsText);

            // Sync all other memory care sliders
            $('.memory-care-slider').not(this).val(offset);
            $('.memory-care-slider').not(this).siblings('.memory-care-value').text(yearsText);

            // TODO: Update backend when memory care offset is implemented
            // For now, this is UI-only (Phase 1)
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

            // Note: Parameter updates are not yet persisted to backend in Phase 1
            // Phase 2 will add backend storage and recalculation
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

        // Update values
        $card.find('.gross-income').text(formatCurrency(metrics.gross_income));
        $card.find('.pool-start').text(formatCurrency(metrics.pool_start));
        $card.find('.pool-min').text(formatCurrency(metrics.pool_min) +
                                      (metrics.pool_min_year ? ' (' + metrics.pool_min_year + ')' : ''));
        $card.find('.pool-final').text(formatCurrency(metrics.pool_final));

        $card.find('.ira-start').text(formatCurrency(metrics.ira_start));
        $card.find('.ira-min').text(formatCurrency(metrics.ira_min) +
                                     (metrics.ira_min_year ? ' (' + metrics.ira_min_year + ')' : ''));
        $card.find('.ira-final').text(formatCurrency(metrics.ira_final));

        $card.find('.ltc-total').text(formatCurrency(metrics.ltc_total));

        // Update tooltips with itemized breakdowns if available
        if (metrics.income_breakdown) {
            $card.find('.gross-income').attr('title', formatBreakdown('Income Sources', metrics.income_breakdown));
        }
        if (metrics.pool_start_breakdown) {
            $card.find('.pool-start').attr('title', formatBreakdown('Pool Start Sources', metrics.pool_start_breakdown));
        }
        if (metrics.pool_final_breakdown) {
            $card.find('.pool-final').attr('title', formatBreakdown('Pool EOY Components', metrics.pool_final_breakdown));
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

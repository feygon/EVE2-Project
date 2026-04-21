/**
 * BurnRate scenarios - client-side interactions
 */

(function() {
    'use strict';

    // Scenario mapping: disposition -> scenario ID
    // LTC trigger year is dynamically updated via slider
    const scenarioMap = {
        baseline: 'ScA_Baseline',
        rental: 'ScA_NoTrust',
        mapt: 'ScA_MAPT'
    };

    let currentTriggerYear = null;

    // Initialize on page load
    $(document).ready(function() {
        initializeSidebar();
        initializeTriggerSelector();
        initializeSliderValues();
        initializeCards();
        initializeSliders();
        initializeDetailLinks();
    });

    /**
     * Initializes parameter sidebar toggle, close button, escape key, and details scroll.
     * @returns {void}
     */
    function initializeSidebar() {
        function setParamSidebarBodyClass(open) {
            if (open) {
                document.body.classList.add('param-sidebar-open');
            } else {
                document.body.classList.remove('param-sidebar-open');
            }
        }

        // Overview: open by default
        if (window.sidebarDefaultOpen) {
            $('#paramSidebar').addClass('open');
            $('#sidebarToggle').addClass('shifted');
            setParamSidebarBodyClass(true);
        }

        $('#sidebarToggle').on('click', function() {
            if ($('#paramSidebar').hasClass('open')) {
                $('#paramSidebar').removeClass('open');
                $(this).removeClass('shifted');
                setParamSidebarBodyClass(false);
            } else {
                $('#paramSidebar').addClass('open');
                $(this).addClass('shifted');
                setParamSidebarBodyClass(true);
            }
        });

        $('#sidebarClose').on('click', function() {
            $('#paramSidebar').removeClass('open');
            $('#sidebarToggle').removeClass('shifted');
            setParamSidebarBodyClass(false);
        });

        // Close on Escape key
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && $('#paramSidebar').hasClass('open')) {
                $('#paramSidebar').removeClass('open');
                $('#sidebarToggle').removeClass('shifted');
                setParamSidebarBodyClass(false);
            }
        });

        // Scroll expanded <details> into view within sidebar
        $('#paramSidebar details.param-group').on('toggle', function() {
            if (this.open) {
                var el = this;
                var container = document.querySelector('#paramSidebar .sidebar-body');
                if (container) {
                    setTimeout(function() {
                        var elRect = el.getBoundingClientRect();
                        var contRect = container.getBoundingClientRect();
                        if (elRect.bottom > contRect.bottom) {
                            var target = container.scrollTop + (elRect.bottom - contRect.bottom);
                            var start = container.scrollTop;
                            var distance = target - start;
                            var duration = Math.min(300, Math.max(150, distance * 0.5));
                            var startTime = null;
                            /**
                             * Eased animation frame callback for smooth scrolling.
                             * @param {number} ts - The DOMHighResTimeStamp from requestAnimationFrame
                             * @returns {void}
                             */
                            function step(ts) {
                                if (!startTime) startTime = ts;
                                var progress = Math.min((ts - startTime) / duration, 1);
                                var ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                                container.scrollTop = start + distance * ease;
                                if (progress < 1) requestAnimationFrame(step);
                            }
                            requestAnimationFrame(step);
                        }
                    }, 50);
                }
            }
        });
    }

    /**
     * Initializes LTC trigger year selector buttons with click handlers.
     * @returns {void}
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
     * Updates all scenario cards to reflect a new LTC trigger year via API.
     * @param {number} year - The LTC trigger year to set
     * @returns {void}
     */
    function updateCardsForTriggerYear(year) {
        console.log('[BurnRate] Updating cards for trigger year:', year);

        // Update all scenarios to the new trigger year
        const scenarioIds = Object.values(scenarioMap);
        const updatePromises = scenarioIds.map(scenarioId => {
            return $.ajax({
                url: '/BurnRate/scenario/' + scenarioId + '/update-ltc',
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

                console.log('[BurnRate] Setting card', disposition, 'to scenario', scenarioId);
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
     * Updates all scenarios with a new memory care start year via API.
     * @param {number} year - The memory care start year
     * @returns {void}
     */
    function updateAllScenariosMemoryCare(year) {
        console.log('[BurnRate] Updating all scenarios memory care year:', year);

        // Update all scenarios to the new year
        const scenarioIds = Object.values(scenarioMap);
        const updatePromises = scenarioIds.map(scenarioId => {
            return $.ajax({
                url: '/BurnRate/scenario/' + scenarioId + '/update-memory-care',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ memoryCareYear: year }),
                xhrFields: { withCredentials: true }
            });
        });

        // Wait for all updates to complete
        Promise.all(updatePromises).then(() => {
            console.log('[BurnRate] Memory care year updated, reloading metrics');
            loadMetricsForAllCards();
        });
    }

    /**
     * Updates all scenarios with a new Managed IRA starting balance via API.
     * @param {number} amount - The new Managed IRA starting balance in dollars
     * @returns {void}
     */
    function updateAllScenariosManagedIra(amount) {
        console.log('[BurnRate] Updating all scenarios ManagedIRA start:', amount);

        // Update all scenarios to the new amount
        const scenarioIds = Object.values(scenarioMap);
        const updatePromises = scenarioIds.map(scenarioId => {
            return $.ajax({
                url: '/BurnRate/scenario/' + scenarioId + '/update-managed-ira',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ managedIraStart: amount }),
                xhrFields: { withCredentials: true }
            });
        });

        // Wait for all updates to complete
        Promise.all(updatePromises).then(() => {
            console.log('[BurnRate] ManagedIRA start updated, reloading metrics');
            loadMetricsForAllCards();
        });
    }

    /**
     * Updates all scenarios with a generic parameter value via API.
     * @param {string} paramName - The backend parameter name to update
     * @param {number} paramValue - The new value for the parameter
     * @returns {void}
     */
    function updateAllScenariosParameter(paramName, paramValue) {
        console.log('[BurnRate] Updating all scenarios', paramName, ':', paramValue);

        const scenarioIds = Object.values(scenarioMap);
        const updatePromises = scenarioIds.map(scenarioId => {
            return $.ajax({
                url: '/BurnRate/scenario/' + scenarioId + '/update-parameter',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ paramName: paramName, paramValue: paramValue }),
                xhrFields: { withCredentials: true }
            });
        });

        Promise.all(updatePromises).then(() => {
            console.log('[BurnRate] Parameter', paramName, 'updated, reloading metrics');
            loadMetricsForAllCards();
        });
    }

    /**
     * Updates all scenarios with a new year of passing via API.
     * @param {number} year - The year of passing to set
     * @returns {void}
     */
    function updateAllScenariosYearOfPassing(year) {
        console.log('[BurnRate] Updating all scenarios year of passing:', year);

        // Update all scenarios to the new year
        const scenarioIds = Object.values(scenarioMap);
        const updatePromises = scenarioIds.map(scenarioId => {
            return $.ajax({
                url: '/BurnRate/scenario/' + scenarioId + '/update-year-of-passing',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ yearOfPassing: year }),
                xhrFields: { withCredentials: true }
            });
        });

        // Wait for all updates to complete
        Promise.all(updatePromises).then(() => {
            console.log('[BurnRate] Year of passing updated, reloading metrics');
            loadMetricsForAllCards();
        });
    }

    /**
     * Constrains memory care slider min/max to stay within LTC trigger year and year of passing.
     * @param {number} triggerYear - The LTC trigger year (slider minimum)
     * @param {number} [yearOfPassing] - The year of passing (slider maximum), defaults to slider value or 2040
     * @returns {void}
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

        console.log('[BurnRate] Memory care range updated to', triggerYear, '-', yearOfPassing);
    }

    /**
     * Initializes scenario cards with proper scenario IDs and memory care range.
     * @returns {void}
     */
    function initializeCards() {
        if (currentTriggerYear === null && window.scenarioData) {
            const firstId = Object.keys(window.scenarioData)[0];
            if (firstId && window.scenarioData[firstId] && window.scenarioData[firstId].ltc_trigger_year) {
                currentTriggerYear = window.scenarioData[firstId].ltc_trigger_year;
            }
        }
        console.log('[BurnRate] Initializing cards for trigger year:', currentTriggerYear);
        $('.scenario-card').each(function() {
            const $card = $(this);
            const disposition = $card.data('disposition');
            const scenarioId = scenarioMap[disposition];

            if (scenarioId) {
                $card.data('scenario-id', scenarioId);
            }
        });

        updateMemoryCareRange(currentTriggerYear);  // Set initial max value
        updateTimelineSummary();
        loadMetricsForAllCards();
    }

    /**
     * Binds click handlers on detail buttons to navigate to scenario detail pages.
     * @returns {void}
     */
    function initializeDetailLinks() {
        $('.btn-details').on('click', function(e) {
            e.preventDefault();
            const $card = $(this).closest('.scenario-card');
            const scenarioId = $card.data('scenario-id');

            if (scenarioId) {
                const dest = '/BurnRate/scenario/' + scenarioId;

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
                console.warn('[BurnRate] No scenario ID found for detail link');
            }
        });
    }

    /**
     * Updates the timeline summary text from current LTC, memory care, and passing year sliders.
     * @returns {void}
     */
    function updateTimelineSummary() {
        const ltcYear = parseInt($('.ltc-slider').first().val()) || 2028;
        const memoryCareYear = parseInt($('.memory-care-slider').first().val()) || 2031;
        const passingYear = parseInt($('.year-of-passing-slider').first().val()) || 2040;

        const summaryText = `LTC insurance payout in ${ltcYear}, Memory Care starts ${memoryCareYear}, Passing in ${passingYear}`;
        $('.timeline-text').text(summaryText);
    }

    /**
     * Binds input/change handlers for all sliders, checkboxes, and toggles in the sidebar.
     * @returns {void}
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
            const nonBaselineIds = ['ScA_NoTrust', 'ScA_MAPT'];

            const updates = nonBaselineIds.map(id => $.ajax({
                url: '/BurnRate/scenario/' + id + '/update-parameter',
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
                url: '/BurnRate/scenario/ScA_MAPT/update-parameter',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ paramName: 'roommate_enabled', paramValue: checked }),
                xhrFields: { withCredentials: true }
            }).then(() => { loadMetricsForAllCards(); });
        });

        // Optimizer toggle (all scenarios)
        $('.optimizer-toggle').on('change', function() {
            const checked = this.checked ? 1 : 0;
            const allIds = ['ScA_Baseline', 'ScA_NoTrust', 'ScA_MAPT'];
            const updates = allIds.map(id => $.ajax({
                url: '/BurnRate/scenario/' + id + '/update-parameter',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ paramName: 'optimizer_enabled', paramValue: checked }),
                xhrFields: { withCredentials: true }
            }));
            Promise.all(updates).then(() => { loadMetricsForAllCards(); });
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
                'sdira_start': 'sdira_start',
                'managed_ira_start': 'managed_ira_start',
                'snt_seed': 'snt_seed',
                'lifestyle': 'lifestyle_annual',
                'lifestyle_floor_monthly': 'lifestyle_floor_monthly',
                'charitable_monthly': 'charitable_monthly',
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
                'ssdi_monthly': 'ssdi_monthly',
                'memory_care_cost': 'memory_care_cost',
                'mc_maintenance_monthly': 'mc_maintenance_monthly',
                'mc_residual_monthly': 'mc_residual_monthly',
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
     * Updates the displayed value text next to a parameter slider based on its type.
     * @param {jQuery} $slider - The slider input element
     * @param {string} param - The parameter name (e.g. 'rental_income', 'ira_growth')
     * @param {number} value - The current slider value
     * @returns {void}
     */
    function updateParamDisplay($slider, param, value) {
        const $display = $slider.siblings('.param-value');
        let displayText = '';

        if (param === 'lifestyle') {
            displayText = '$' + formatNumber(value) + '/yr';
        } else if (param === 'rental_income') {
            displayText = '$' + formatNumber(value) + '/mo';
        } else if (param === 'medical_base_monthly' || param === 'roommate_monthly' || param === 'ssdi_monthly' || param === 'lifestyle_floor_monthly' || param === 'charitable_monthly' || param === 'mc_maintenance_monthly' || param === 'mc_residual_monthly') {
            displayText = '$' + formatNumber(value) + '/mo';
        } else if (param === 'managed_ira_start' || param === 'total_mortgage_amount' || param === 'primary_house_value' || param === 'condo_value' || param === 'sdira_start' || param === 'snt_seed') {
            displayText = '$' + formatNumber(value);
        } else if (param === 'memory_care_cost' || param === 'condo_maintenance') {
            displayText = '$' + formatNumber(value) + '/yr';
        } else if (param === 'mortgage_split_pct') {
            displayText = value + '% down';
        } else {
            displayText = value.toFixed(1) + '%';
        }

        $display.text(displayText);
    }

    /**
     * Initializes slider values from DB scenario data injected as window.scenarioData.
     * @returns {void}
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
            'sdira_start':             { val: data.sdira_start },
            'managed_ira_start':       { val: data.managed_ira_start },
            'snt_seed':                { val: data.snt_seed },
            'lifestyle':               { val: data.lifestyle_annual },
            'lifestyle_floor_monthly': { val: data.lifestyle_floor_monthly },
            'charitable_monthly':      { val: data.charitable_monthly },
            'primary_appreciation':    { val: data.primary_appreciation * 100 },
            'condo_appreciation':      { val: data.condo_appreciation * 100 },
            'memory_care_inflation':   { val: data.memory_care_inflation * 100 },
            'management_fee':          { val: data.management_fee * 100 },
            'rental_income':           { val: data.rental_income_monthly },
            'heloc_rate':              { val: data.heloc_rate * 100 },
            'medical_base_monthly':    { val: data.medical_base_monthly },
            'ssdi_monthly':            { val: data.ssdi_monthly },
            'memory_care_cost':        { val: data.memory_care_cost },
            'mc_maintenance_monthly':  { val: data.mc_maintenance_monthly },
            'mc_residual_monthly':     { val: data.mc_residual_monthly },
            'total_mortgage_amount':   { val: data.total_mortgage_amount },
            'mortgage_split_pct':      { val: data.mortgage_split_pct * 100 },
            'primary_mortgage_rate':   { val: data.primary_mortgage_rate * 100 },
            'condo_mortgage_rate':     { val: data.condo_mortgage_rate * 100 },
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
            currentTriggerYear = data.ltc_trigger_year;
            $('.ltc-slider').val(data.ltc_trigger_year);
            $('.ltc-slider').siblings('.ltc-value, .trigger-value').text(data.ltc_trigger_year);
            $('.trigger-btn').removeClass('active');
            $('.trigger-btn[data-year="' + data.ltc_trigger_year + '"]').addClass('active');
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
        var rentalData = window.scenarioData['ScA_NoTrust'];
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
            // Optimizer toggle (init from MAPT — applies to all)
            if (maptData.optimizer_enabled !== undefined) {
                $('.optimizer-toggle').prop('checked', maptData.optimizer_enabled === 1);
            }
        }
    }

    /**
     * Fetches metrics from the server for all visible scenario cards and updates their displays.
     * @returns {void}
     */
    function loadMetricsForAllCards() {
        const scenarioIds = [];

        $('.scenario-card').each(function() {
            const scenarioId = $(this).data('scenario-id');
            console.log('[BurnRate] Card scenario ID:', scenarioId);
            if (scenarioId) {
                scenarioIds.push(scenarioId);
            }
        });

        console.log('[BurnRate] Loading metrics for scenarios:', scenarioIds);

        if (scenarioIds.length === 0) {
            console.warn('[BurnRate] No scenario IDs found, skipping metrics load');
            return;
        }

        // Show loading state
        $('.scenario-card').addClass('loading');

        $.ajax({
            url: '/BurnRate/scenarios/metrics',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ scenarioIds: scenarioIds }),
            xhrFields: {
                withCredentials: true
            },
            success: function(response) {
                console.log('[BurnRate] Metrics response:', response);
                console.log('[BurnRate] Response.success:', response.success);
                console.log('[BurnRate] Response.metrics:', response.metrics);

                if (response.success) {
                    console.log('[BurnRate] Success is true, updating cards...');

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
                        console.log('[BurnRate] Checking scenario:', scenarioId);
                        console.log('[BurnRate] Metrics for this scenario:', response.metrics[scenarioId]);
                        if (response.metrics[scenarioId]) {
                            console.log('[BurnRate] Calling updateCardMetrics for', scenarioId);
                            updateCardMetrics($(this), response.metrics[scenarioId]);
                        } else {
                            console.warn('[BurnRate] No metrics found for', scenarioId);
                        }
                    });
                } else {
                    console.error('[BurnRate] Response.success was false');
                }
                $('.scenario-card').removeClass('loading');
            },
            error: function(xhr, status, error) {
                console.error('[BurnRate] Error loading metrics:', error);
                console.error('[BurnRate] XHR:', xhr);
                $('.scenario-card').removeClass('loading');
            }
        });
    }

    /**
     * Updates the LTC trigger year for a single scenario card via API.
     * @param {jQuery} $card - The scenario card element
     * @param {string} scenarioId - The scenario identifier
     * @param {number} newYear - The new LTC trigger year
     * @returns {void}
     */
    function updateScenarioLTC($card, scenarioId, newYear) {
        $card.addClass('loading');

        $.ajax({
            url: '/BurnRate/scenario/' + scenarioId + '/update-ltc',
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
     * Updates a scenario card's DOM with computed financial metrics.
     * @param {jQuery} $card - The scenario card element to update
     * @param {Object} metrics - Metrics object with liquid assets, IRA, real estate, and trust data
     * @returns {void}
     */
    function updateCardMetrics($card, metrics) {
        console.log('[BurnRate] Updating card metrics:', metrics);
        console.log('[BurnRate] Card disposition:', $card.data('disposition'));

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

        // MAPT + SNT balances (only for MAPT scenario)
        if (metrics.trust_balance_final !== undefined && metrics.trust_balance_final !== null) {
            var maptText = formatCurrency(metrics.trust_balance_final || 0);
            var sntText = formatCurrency(metrics.snt_balance_final || 0);
            if ((metrics.trust_balance_final || 0) <= 0 && metrics.trust_exhausted_year) {
                maptText = '$0 (exhausted ' + metrics.trust_exhausted_year + ')';
            }
            $card.find('.mapt-balance-final').text(maptText);
            $card.find('.snt-balance-final').text(sntText);
            $card.find('.mapt-only').show();
        }

        // Update final real estate values (multi-line display)
        let realEstateLines = [];
        realEstateLines.push('Primary: ' + formatCurrency(metrics.house_value_final));

        if (metrics.condo_value_final > 0) {
            realEstateLines.push('legacy property: ' + formatCurrency(metrics.condo_value_final));
        } else if (metrics.condo_sale_year) {
            realEstateLines.push('legacy property: $0 (sold ' + metrics.condo_sale_year + ')');
        } else {
            realEstateLines.push('legacy property: $0');
        }

        // Join with line breaks and set HTML
        $card.find('.real-estate-final').html(realEstateLines.join('<br>'));

        // Update real estate liquidation (multi-line display)
        let realEstateLiqLines = [];
        let realEstateTooltipParts = [];

        // Show condo sale if it happened
        if (metrics.condo_sale_year) {
            realEstateLiqLines.push('Property sold: ' + formatCurrency(metrics.condo_sale_proceeds) + ' (' + metrics.condo_sale_year + ')');
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

        console.log('[BurnRate] Metrics updated');
    }

    /**
     * Formats a key-value breakdown object into a multiline tooltip string.
     * @param {string} title - The tooltip heading
     * @param {Object} breakdown - Key-value pairs of account names to dollar amounts
     * @returns {string} Newline-separated tooltip text
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
     * Formats a number as a compact currency string (e.g. '$1.23M', '$45k', '$0').
     * @param {number|null|undefined} value - The dollar amount to format
     * @returns {string} Formatted currency string, or em-dash for null/undefined
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
     * Formats a number with comma-separated thousands.
     * @param {number|string} value - The value to format
     * @returns {string} The formatted number string with commas
     */
    function formatNumber(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

})();

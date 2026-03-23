/**
 * Parameter Sidebar - shared between overview and detail views
 * On overview: nickerson-scenarios.js handles slider events (sidebar is just a container)
 * On detail: this file handles sidebar toggle + slider → API → page reload
 */

(function() {
    'use strict';

    // Restore sidebar state from sessionStorage (survives reload)
    if (sessionStorage.getItem('sidebarOpen') === 'true') {
        $('#paramSidebar').addClass('open');
        $('#sidebarToggle').addClass('shifted');
    }

    // Restore open/closed state of <details> param groups
    var savedGroupState = sessionStorage.getItem('paramGroupState');
    if (savedGroupState) {
        var states = JSON.parse(savedGroupState);
        $('#paramSidebar details.param-group').each(function(i) {
            if (i < states.length) {
                if (states[i]) {
                    $(this).attr('open', '');
                } else {
                    $(this).removeAttr('open');
                }
            }
        });
        sessionStorage.removeItem('paramGroupState');
    }

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

    // Sidebar toggle (open/close)
    $('#sidebarToggle').on('click', function() {
        if ($('#paramSidebar').hasClass('open')) {
            $('#paramSidebar').removeClass('open');
            $(this).removeClass('shifted');
            sessionStorage.setItem('sidebarOpen', 'false');
        } else {
            $('#paramSidebar').addClass('open');
            $(this).addClass('shifted');
            sessionStorage.setItem('sidebarOpen', 'true');
        }
    });

    $('#sidebarClose').on('click', function() {
        $('#paramSidebar').removeClass('open');
        $('#sidebarToggle').removeClass('shifted');
        sessionStorage.setItem('sidebarOpen', 'false');
    });

    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $('#paramSidebar').hasClass('open')) {
            $('#paramSidebar').removeClass('open');
            $('#sidebarToggle').removeClass('shifted');
            sessionStorage.setItem('sidebarOpen', 'false');
        }
    });

    // Initialize slider values from scenario data
    if (window.scenarioData) {
        var firstId = Object.keys(window.scenarioData)[0];
        if (firstId) {
            var data = window.scenarioData[firstId];
            initSidebarSliders(data);
        }
    }

    function initSidebarSliders(data) {
        var paramInit = {
            'ira_growth':            data.ira_growth * 100,
            'sdira_start':           data.sdira_start,
            'managed_ira_start':     data.managed_ira_start,
            'lifestyle':             data.lifestyle_annual,
            'primary_appreciation':  data.primary_appreciation * 100,
            'condo_appreciation':    data.condo_appreciation * 100,
            'memory_care_inflation': data.memory_care_inflation * 100,
            'management_fee':        data.management_fee * 100,
            'rental_income':         data.rental_income_monthly,
            'heloc_rate':            data.heloc_rate * 100,
            'medical_base_monthly':  data.medical_base_monthly,
            'memory_care_cost':      data.memory_care_cost,
            'total_mortgage_amount': data.total_mortgage_amount,
            'mortgage_split_pct':    data.mortgage_split_pct * 100,
            'primary_mortgage_rate': data.primary_mortgage_rate * 100,
            'condo_mortgage_rate':   data.condo_mortgage_rate * 100,
            'condo_maintenance':     data.condo_maintenance,
            'primary_house_value':   data.primary_house_value,
            'condo_value':           data.condo_value,
            'rental_increase_rate':  data.rental_increase_rate * 100
        };

        Object.keys(paramInit).forEach(function(param) {
            var val = paramInit[param];
            if (val === undefined || val === null) return;
            $('#paramSidebar .param-slider[data-param="' + param + '"]').each(function() {
                $(this).val(val);
                updateDisplay($(this), param, val);
            });
        });

        // Timeline sliders
        if (data.ltc_trigger_year) {
            $('#paramSidebar .ltc-slider').val(data.ltc_trigger_year);
            $('#paramSidebar .ltc-value').text(data.ltc_trigger_year);
        }
        if (data.memory_care_year) {
            $('#paramSidebar .memory-care-slider').val(data.memory_care_year);
            $('#paramSidebar .memory-care-value').text(data.memory_care_year);
        }
        if (data.year_of_passing) {
            $('#paramSidebar .year-of-passing-slider').val(data.year_of_passing);
            $('#paramSidebar .year-of-passing-value').text(data.year_of_passing);
        }

        // Sell-condo checkbox
        if (data.sell_condo_upfront !== undefined) {
            $('#sidebar-sell-condo').prop('checked', data.sell_condo_upfront === 1);
        }

        // Roommate checkbox and slider
        if (data.roommate_enabled !== undefined) {
            $('#sidebar-roommate').prop('checked', data.roommate_enabled === 1);
            if (data.roommate_enabled === 1) {
                $('.roommate-amount').show();
            }
        }
        if (data.roommate_monthly) {
            $('.param-slider[data-param="roommate_monthly"]').val(data.roommate_monthly);
            updateDisplay($('.param-slider[data-param="roommate_monthly"]'), 'roommate_monthly', data.roommate_monthly);
        }
    }

    function updateDisplay($slider, param, value) {
        var $display = $slider.siblings('.param-value');
        var text = '';
        if (param === 'lifestyle') {
            text = '$' + fmtNum(value) + '/yr';
        } else if (param === 'rental_income' || param === 'medical_base_monthly' || param === 'roommate_monthly') {
            text = '$' + fmtNum(value) + '/mo';
        } else if (param === 'sdira_start' || param === 'managed_ira_start' || param === 'total_mortgage_amount' || param === 'primary_house_value' || param === 'condo_value') {
            text = '$' + fmtNum(value);
        } else if (param === 'memory_care_cost' || param === 'condo_maintenance') {
            text = '$' + fmtNum(value) + '/yr';
        } else if (param === 'mortgage_split_pct') {
            text = value + '% / ' + (100 - value) + '%';
        } else {
            text = parseFloat(value).toFixed(1) + '%';
        }
        $display.text(text);
    }

    function fmtNum(v) {
        return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Detail view: slider changes update the scenario and reload the projection table
    if (window.currentScenarioId) {
        var scenarioId = window.currentScenarioId;

        var paramMap = {
            'ira_growth': 'ira_growth',
            'sdira_start': 'sdira_start',
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
            'primary_house_value': 'primary_house_value',
            'condo_value': 'condo_value',
            'roommate_monthly': 'roommate_monthly',
            'rental_increase_rate': 'rental_increase_rate'
        };

        var percentageParams = ['ira_growth', 'primary_appreciation', 'condo_appreciation',
                                'memory_care_inflation', 'management_fee',
                                'primary_mortgage_rate', 'condo_mortgage_rate', 'heloc_rate',
                                'mortgage_split_pct', 'rental_increase_rate'];

        // Param sliders
        $('#paramSidebar .param-slider').on('input', function() {
            var param = $(this).data('param');
            var value = parseFloat($(this).val());
            updateDisplay($(this), param, value);

            if (paramMap[param]) {
                clearTimeout(window.detailParamTimer);
                window.detailParamTimer = setTimeout(function() {
                    var backendValue = percentageParams.indexOf(param) !== -1 ? value / 100 : value;
                    updateAndReload(paramMap[param], backendValue);
                }, 500);
            }
        });

        // Timeline sliders
        $('#paramSidebar .ltc-slider').on('input', function() {
            var year = parseInt($(this).val());
            $(this).siblings('.ltc-value').text(year);
            clearTimeout(window.detailLtcTimer);
            window.detailLtcTimer = setTimeout(function() {
                $.ajax({
                    url: '/Nickerson/scenario/' + scenarioId + '/update-ltc',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ ltcTrigger: year }),
                    xhrFields: { withCredentials: true }
                }).then(reloadKeepingSidebar);
            }, 500);
        });

        $('#paramSidebar .memory-care-slider').on('input', function() {
            var year = parseInt($(this).val());
            $(this).siblings('.memory-care-value').text(year);
            clearTimeout(window.detailMcTimer);
            window.detailMcTimer = setTimeout(function() {
                $.ajax({
                    url: '/Nickerson/scenario/' + scenarioId + '/update-memory-care',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ memoryCareYear: year }),
                    xhrFields: { withCredentials: true }
                }).then(reloadKeepingSidebar);
            }, 500);
        });

        $('#paramSidebar .year-of-passing-slider').on('input', function() {
            var year = parseInt($(this).val());
            $(this).siblings('.year-of-passing-value').text(year);
            clearTimeout(window.detailYopTimer);
            window.detailYopTimer = setTimeout(function() {
                $.ajax({
                    url: '/Nickerson/scenario/' + scenarioId + '/update-year-of-passing',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ yearOfPassing: year }),
                    xhrFields: { withCredentials: true }
                }).then(reloadKeepingSidebar);
            }, 500);
        });

        // Sell-condo checkbox
        $('#sidebar-sell-condo').on('change', function() {
            var checked = this.checked ? 1 : 0;
            updateAndReload('sell_condo_upfront', checked);
        });

        // Roommate checkbox
        $('#sidebar-roommate').on('change', function() {
            var checked = this.checked ? 1 : 0;
            if (checked) {
                $('.roommate-amount').show();
            } else {
                $('.roommate-amount').hide();
            }
            updateAndReload('roommate_enabled', checked);
        });

        function reloadKeepingSidebar() {
            if ($('#paramSidebar').hasClass('open')) {
                sessionStorage.setItem('sidebarOpen', 'true');
            }
            // Save open/closed state of each <details> group
            var detailsState = [];
            $('#paramSidebar details.param-group').each(function() {
                detailsState.push($(this).attr('open') !== undefined);
            });
            sessionStorage.setItem('paramGroupState', JSON.stringify(detailsState));
            location.reload();
        }

        function updateAndReload(paramName, paramValue) {
            $.ajax({
                url: '/Nickerson/scenario/' + scenarioId + '/update-parameter',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ paramName: paramName, paramValue: paramValue }),
                xhrFields: { withCredentials: true }
            }).then(reloadKeepingSidebar);
        }
    }

})();

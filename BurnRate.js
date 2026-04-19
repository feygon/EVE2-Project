/**
 * Public BurnRate demo router.
 * Additive route family built from the stabilized planner baseline without
 * requiring private auth/session gating.
 */
var express = require('express');
var router = express.Router();
var appVersion = require('./package.json').version;

var ALLOWED_PARAMS = [
    'ira_growth', 'lifestyle_annual', 'primary_appreciation',
    'condo_appreciation', 'memory_care_inflation', 'management_fee',
    'rental_income_monthly', 'heloc_rate', 'managed_ira_start',
    'medical_base_monthly', 'memory_care_cost',
    'total_mortgage_amount', 'mortgage_split_pct',
    'primary_mortgage_rate', 'condo_mortgage_rate',
    'condo_maintenance', 'condo_original_basis',
    'sell_condo_upfront',
    'roommate_enabled', 'roommate_monthly',
    'primary_house_basis',
    'primary_house_value', 'condo_value',
    'rental_increase_rate', 'sdira_start',
    'ssdi_monthly',
    'lifestyle_floor_monthly', 'charitable_monthly', 'mc_maintenance_monthly', 'mc_residual_monthly',
    'snt_seed', 'optimizer_enabled', 'trust_type'
];

router.use(function(req, res, next) {
    res.locals.appVersion = appVersion;
    var db = req.app.get('dbBurnRate');
    if (db) {
        try {
            res.locals.navScenarios = db.prepare(
                "SELECT id, name FROM scenario ORDER BY CASE id WHEN 'ScA_Baseline' THEN 1 WHEN 'ScA_NoTrust' THEN 2 WHEN 'ScA_MAPT' THEN 3 ELSE 4 END"
            ).all();
        } catch (e) {
            res.locals.navScenarios = [];
        }
    }
    next();
});

router.get('/', function(req, res) {
    var context = {};
    var db = req.app.get('dbBurnRate');
    var callbacks = req.app.get('BurnRateCallbacks');

    callbacks.getScenarios(res, db, context, function() {
        res.render('burnrate/scenarios', {
            layout: 'burnrate',
            title: 'BurnRate - Scenarios',
            scenarios: context.scenarios,
            routeBase: '/BurnRate'
        });
    });
});

router.get('/scenario/:id', function(req, res) {
    var context = {};
    var db = req.app.get('dbBurnRate');
    var callbacks = req.app.get('BurnRateCallbacks');
    var scenarioId = req.params.id;

    callbacks.getScenarioDetail(res, db, context, scenarioId, function() {
        res.render('burnrate/scenario-detail', {
            layout: 'burnrate',
            title: 'BurnRate - ' + (context.scenario ? context.scenario.name : 'Scenario'),
            scenario: context.scenario,
            parameters: context.parameters,
            projections: context.projections,
            outcome: context.outcome,
            annotations: context.annotations,
            instruments: context.instruments,
            ltcPolicy: context.ltcPolicy,
            optimizer: context.optimizer,
            routeBase: '/BurnRate'
        });
    });
});

function updateScenarioAndRecalculate(req, res, column, value) {
    var db = req.app.get('dbBurnRate');
    var callbacks = req.app.get('BurnRateCallbacks');
    var scenarioId = req.params.id;

    try {
        db.prepare('UPDATE scenario SET ' + column + ' = ? WHERE id = ?')
            .run(value, scenarioId);

        callbacks.getProjections(res, db, scenarioId, function(result) {
            if (result.success) {
                var metrics = callbacks._calculateMetrics(result.years);
                res.json({ success: true, metrics: metrics });
            } else {
                res.json({ success: false, error: result.error });
            }
        });
    } catch (err) {
        console.error('Error updating ' + column + ':', err);
        res.json({ success: false, error: err.message });
    }
}

router.post('/scenario/:id/update-ltc', function(req, res) {
    updateScenarioAndRecalculate(req, res, 'ltc_trigger_year', parseInt(req.body.ltcTrigger));
});

router.post('/scenario/:id/update-memory-care', function(req, res) {
    updateScenarioAndRecalculate(req, res, 'memory_care_year', parseInt(req.body.memoryCareYear));
});

router.post('/scenario/:id/update-managed-ira', function(req, res) {
    updateScenarioAndRecalculate(req, res, 'managed_ira_start', parseInt(req.body.managedIraStart));
});

router.post('/scenario/:id/update-parameter', function(req, res) {
    var paramName = req.body.paramName;

    if (!ALLOWED_PARAMS.includes(paramName)) {
        return res.json({ success: false, error: 'Invalid parameter name' });
    }

    updateScenarioAndRecalculate(req, res, paramName, parseFloat(req.body.paramValue));
});

router.post('/scenario/:id/update-year-of-passing', function(req, res) {
    updateScenarioAndRecalculate(req, res, 'year_of_passing', parseInt(req.body.yearOfPassing));
});

router.post('/scenarios/metrics', function(req, res) {
    var db = req.app.get('dbBurnRate');
    var callbacks = req.app.get('BurnRateCallbacks');
    var scenarioIds = req.body.scenarioIds || [];

    var results = {};
    var pending = scenarioIds.length;

    if (pending === 0) {
        return res.json({ success: true, metrics: {} });
    }

    scenarioIds.forEach(function(scenarioId) {
        var scenario = db.prepare('SELECT ltc_trigger_year, memory_care_year, year_of_passing FROM scenario WHERE id = ?').get(scenarioId);

        callbacks.getProjections(res, db, scenarioId, function(result) {
            if (result.success) {
                var metrics = callbacks._calculateMetrics(result.years);
                results[scenarioId] = {
                    ...metrics,
                    ltc_trigger_year: scenario.ltc_trigger_year,
                    memory_care_year: scenario.memory_care_year,
                    year_of_passing: scenario.year_of_passing || 2040
                };
            }
            pending--;
            if (pending === 0) {
                res.json({ success: true, metrics: results });
            }
        });
    });
});

router.post('/restart', function(req, res) {
    res.json({ status: 'restarting' });
    console.log('[BurnRate] Restart requested — exiting with code 75');
    setTimeout(function() { process.exit(75); }, 200);
});

module.exports = router;
module.exports.ALLOWED_PARAMS = ALLOWED_PARAMS;
module.exports.updateScenarioAndRecalculate = updateScenarioAndRecalculate;

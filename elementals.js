/**
 * Elemental Comparison Tool Routes
 * For Summon Elemental spell - compare creatures by level, traits, and stats
 * Follows the animals.js pattern as a standalone SPA
 */

const express = require('express');
const router = express.Router();

/**
 * GET /elementals
 * Main elementals comparison page (standalone SPA like animals.js)
 */
router.get('/', function(req, res) {
    const context = {};
    const callbacks = req.app.get('elementalsCallbacks');

    callbacks.getElementalsPage(res, context, complete);

    function complete() {
        res.render('elementals', {
            layout: null,
            title: 'Summon Elemental - Creature Comparison',
            ...context
        });
    }
});

/**
 * GET /elementals/api/list
 * API endpoint for filtered elemental list
 */
router.get('/api/list', function(req, res) {
    const callbacks = req.app.get('elementalsCallbacks');
    callbacks.filterElementals(req, res);
});

/**
 * GET /elementals/api/detail/:id
 * Get detailed info for a specific elemental
 */
router.get('/api/detail/:id', function(req, res) {
    const callbacks = req.app.get('elementalsCallbacks');
    callbacks.getElementalDetail(req, res);
});

module.exports = router;

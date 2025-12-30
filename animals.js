/**
 * Animal Comparison Tool Routes
 * For Summon Animal spell - compare creatures by level, traits, and stats
 * Follows the illusion.js pattern as a standalone SPA
 */

const express = require('express');
const router = express.Router();

/**
 * GET /animals
 * Main animals comparison page (standalone SPA like illusion.js)
 */
router.get('/', function(req, res) {
    const context = {};
    const callbacks = req.app.get('animalsCallbacks');
    
    callbacks.getAnimalsPage(res, context, complete);
    
    function complete() {
        res.render('animals', {
            layout: null,
            title: 'Summon Animal - Creature Comparison',
            ...context  // Spread entire context
        });
    }
});

/**
 * GET /animals/api/list
 * API endpoint for filtered animal list
 */
router.get('/api/list', function(req, res) {
    const callbacks = req.app.get('animalsCallbacks');
    callbacks.filterAnimals(req, res);
});

/**
 * GET /animals/api/detail/:id
 * Get detailed info for a specific animal
 */
router.get('/api/detail/:id', function(req, res) {
    const callbacks = req.app.get('animalsCallbacks');
    callbacks.getAnimalDetail(req, res);
});

module.exports = router;

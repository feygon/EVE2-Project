/**
 * @file SPA Resume module
 * @summary Modern single-page resume view
 * @description Following the IIFE module pattern, this router handles the SPA resume view
 * @date 2025-02-07
 * @author Feygon Nickerson
 */

module.exports = (function() {

    var express = require('express');
    var router = express.Router();

    // Main SPA resume route - standalone SPA like illusion.js and animals.js
    router.get('/', function(req, res) {
        res.render('spa-resume', {
            layout: null,
            title: 'Resume - Feygon Nickerson'
        });
    });

    return router;
})();

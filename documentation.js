/**
 * @file Documentation routes module
 * @summary Handles all documentation-related routes including portal, markdown files, and README
 * @description Serves the documentation portal, static markdown files, and project README
 * @date 2025-12-24
 * @author Feygon Nickerson
 */

var express = require('express');
var router = express.Router();
var path = require('path');

/**
 * Documentation Portal Route
 * Serves the main documentation index page with search functionality
 */
router.get('/documentation', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

/**
 * Static Documentation Files
 * Serves markdown files and other documentation assets
 * Must come after specific routes to avoid conflicts
 */
router.use('/docs', express.static(path.join(__dirname, 'docs')));

/**
 * README Route
 * Serves the project README.md file
 */
router.get('/README.md', (req, res) => {
    res.sendFile(path.join(__dirname, 'README.md'));
});

module.exports = router;

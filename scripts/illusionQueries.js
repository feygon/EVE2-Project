// illusionQueries.js

var queries = {};
queries.select = {};

/**
 * Executes a simple select against the pre-defined View.
 * The View already handles the JOINs and camelCase aliasing.
 */
queries.select.view_spell_details_by_category = `
    SELECT * FROM view_spell_details_by_category 
    ORDER BY displayOrder ASC, rank ASC, spellName ASC;
`;

module.exports = queries;
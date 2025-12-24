// illusionCallbacks.js
var queries = require('./illusionQueries');

var illusionCallbacks = {
    /**
     * Fetches and organizes illusion spells by category.
     * Uses view_categories for metadata and view_spell_details_by_category for spell data.
     */
    getIllusionPage: function(res, mysql, context, complete) {
        
        // Define the SQL for the new categories view
        var sqlCategories = "SELECT * FROM view_categories";
        // existing query from your queries file
        var sqlSpells = queries.select.view_spell_details_by_category;

        // 1. Fetch Category Metadata (IDs, Names, Descriptions)
        mysql.pool.query(sqlCategories, function(error, catRows) {
            if (error) {
                console.error("SQL Error fetching categories:", error);
                res.status(500).send({ message: "Database Error", error: error });
                return;
            }

            // Store raw category view in context as requested
            context.view_categories = catRows;

            // 2. Fetch all Spell Details
            mysql.pool.query(sqlSpells, function(error, spellRows) {
                if (error) {
                    console.error("SQL Error fetching spells:", error);
                    res.status(500).send({ message: "Database Error", error: error });
                    return;
                }

                var categoryMap = {};
                var categories = [];

                // 3. Initialize the category structure using view_categories metadata
                catRows.forEach(function(cat) {
                    categoryMap[cat.categoryId] = {
                        categoryId: cat.categoryId,
                        categoryName: cat.categoryName,
                        categoryDescription: cat.categoryDescription,
                        spells: []
                    };
                    categories.push(categoryMap[cat.categoryId]);
                });

                // 4. Populate spells into their respective categories
                spellRows.forEach(function(row) {
                    var catId = row.categoryId;
                    
                    // Ensure the category exists in our map before pushing
                    if (categoryMap[catId]) {
                        categoryMap[catId].spells.push({
                            id: row.id,
                            spellName: row.spellName,
                            archiveURL: row.archiveURL,
                            rank: row.rank,
                            traits: row.traits,
                            actions: row.actions,
                            spellTarget: row.spellTarget,
                            spellRange: row.spellRange,
                            area: row.area,
                            duration: row.duration,
                            defense: row.defense,
                            rarity: row.rarity,
                            summary: row.summary,
                            spoilers: row.spoilers,
                            source: row.source,
                            heighten: row.heighten
                        });
                    }
                });

                // 5. Finalize Context
                context.categories = categories;
                complete();
            });
        });
    }
};

module.exports = illusionCallbacks;
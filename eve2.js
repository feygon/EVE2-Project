module.exports = function() {

    var express = require('express');
    var router = express.Router();

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        res.render('homepage', context);
        });

    router.get('/player', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        res.render('player', context);
        });

    router.get('/space_station/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        res.render('space_station', context);
        });

    router.get('/out_in_space/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        res.render('out_in_space', context);
        });

    router.get('/industry/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        res.render('industry', context);
        });

    router.get('/readMe/', function(req, res){
	var context = {};
	res.render('readme', context);
	});

    return router;
}();

// an example of a fully fleshed out route w/ express-handlebars functionality
/*    router.get('/factory/', function(req,res){
        callbackCount = 0;                                          // each callback calls complete() when it finishes. This prevents the function from going forward without finishing its asynchronous calls.
        var context = {};                                           // the data structure we'll be loading with data in our callbacks
        var mysql = req.app.get('mysql');                           // getting our previously 'require'd mysql API
        context.jsscripts = ["recipes.js", "helpers.js"];           // getting our in-app scripts, such as any helpers and partials code we might call upon -- these get appended into the context so they're available to run at runtime
                                                                    // also a place to hide ugly code.
        registerHelpers(res, [ <files go here> ], context, complete);   // registers the helpers, making encapsulated code accessible to be called by scripts during runtime.
        registerPartials(res, [ <files go here> ], context, complete);  // registers the partials, lands their html in context under partialCamelCase names to be scripted in later, I think.

        getFactories(res, mysql, context, complete);                // an example callback -- contains an asychronous sql call to our database
        getFactories(res, mysql, context, complete, "executes");    // an example callback -- contains a different asynchronous call to our database
        getBPs(res, mysql, context, complete, "BPC");               // an example callback -- contains a different asynchronous call to our database

        function complete(){                                        // called when an asynchronous call is done
            callbackCount++;                                        // increments counter
            if(callbackCount >= 3){                                 // checks that counter shows the right number of asynchronous calls completed
                res.render('Factories', context);                   // renders the page with the loaded context.
            }
        }
    });
*/

//here's the code for the callback getfactories
/*
function getFactories(res, mysql, context, complete, by){
        var sql = "";
        sql += queries.select.factories
        var inserts = [req.params.factory, req.params.product];     // these fill in the '?'s sanitarily

        mysql.pool.query(sql, function(error, results, fields){     // get sequel query results
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.executes = results;                             // add results to context
            complete();
        });
    }
*/
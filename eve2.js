module.exports = function() {

    var express = require('express');
    var router = express.Router();
    var callbacks = req.app.get('callbacks');

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

        context = callbacks.cb_indy_getItems(res, mysql, context, complete);
        context.jsscripts = []; // none yet

        function complete(){
            callbackCount++;
            if (callbackCount >= 1){
                res.render('industry', context);
            }
        }
        
    });

    router.get('/readMe/', function(req, res){
	   var context = {};
	   res.render('readme', context);
	});

    return router;
}();

// an example of a fully fleshed out route w/ express-handlebars functionality
/*    router.get('/factory/', function(req,res){

        // each callback calls complete() when it finishes. This prevents the
        // function from going forward without finishing its asynchronous calls.
        callbackCount = 0;                                          

        // the data structure we'll be loading with data in our callbacks
        var context = {};                                           

        // getting our previously 'require'd mysql API
        var mysql = req.app.get('mysql');                           

        // getting our in-app scripts, such as any helpers and partials code we might call upon 
        // -- these get appended into the context so they're available to run at runtime
        context.jsscripts = ["recipes.js", "helpers.js"];           

        // registers the helpers, making encapsulated code accessible to be called by scripts during runtime.
        registerHelpers(res, [ <files go here> ], context, complete);   

        // registers the partials, lands their html in context under partialCamelCase names to be scripted in later, I think.
        registerPartials(res, [ <files go here> ], context, complete);

        // an example callback -- contains an asychronous sql call to our database
        getFactories(res, mysql, context, complete);                

        // an example callback -- contains a different asynchronous call to our database
        getBPs(res, mysql, context, complete, "BPC");               

        // where the magic happens after all the prep
        function complete(){                        // called when an asynchronous call is done
            callbackCount++;                        // increments counter
            if(callbackCount >= 3){                 // checks that all asynchronous calls completed
                res.render('Factories', context);   // renders the page with the loaded context.
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

        mysql.pool.query(sql, inserts, function(error, results, fields){     // get sequel query results
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.executes = results;                             // add results to context
            complete();
        });
    }
*/
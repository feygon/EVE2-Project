// default method export, overloading the get function with string cases.
module.exports = (function() {
    
    var express = require('express');
    var router = express.Router();
    var callbacks = require('./scripts/callbacks');
    var queries = require('./scripts/queries');

    /********************************************
     *
     *  Basic Get routes without callbacks      *
     * 
     *******************************************/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        res.render('homepage', context);
        });

    router.get('/player/', function(req, res){
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
    
    router.get('/readMe/', function(req, res){
        var context = {};
        res.render('readme', context);
        });
         
     
        /********************************************
         * 
         *      Get routes w/ callbacks             *
         * 
         *******************************************/

    // get industry page
    //      call back to get item list

    router.get('/industry/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');

        //console.log("mysql3: " + mysql);

        callbacks.item_structure_list(res, mysql, context, complete);
        callbacks.item_structure_types(res, mysql, context, complete);
        callbacks.item_use_scales(res, mysql, context, complete);
        callbacks.useless_item_structures(res, mysql, context, complete);

        //context.jsscripts = []; // no client-side scripts yet

        function complete(){
            callbackCount++;
        //    console.log("Callback " + callbackCount + " complete.");
            if (callbackCount >= 4){

                //console.log(`Context is ${JSON.stringify(context)}.`);

                res.render('industry', context);
            }
        //    console.log("Done with complete function.");
        }
        
    });

    /************************************************
    *
    *       Post Routes w/ sql                      *
    *   
    ************************************************/
    
    // remember later to hook this up with 2 inserts to EVE2_LINKS.
    router.post('/wormhole/', function(req,res){
        var mysql = req.app.get('mysql');
	    var sql = queries.insert.insert_location;
	    var inserts = [req.body.name,
		    	req.body.Security];

	    sql = mysql.pool.query(sql,inserts,function(error,results,fields){
		    if(error){
			    res.write("wormhole post router says: " + JSON.stringify(error));
			    res.end();
		    }else{
			    res.redirect('/eve2/out_in_space');
		    }
	    });
    });


    router.post('/inventstructure/', function(req,res){
        var mysql = req.app.get('mysql');
        
	    var sql = queries.insert.insert_item_structure;
 	    var inserts = [req.body.name,
 		    req.body.packaged,
 		    req.body.unpackaged,
 		    req.body.type];
 	    sql = mysql.pool.query(sql,inserts,function(error,results,fields){
		    if(error){
		 	    res.write("invent item structure post router says: " + JSON.stringify(error));
			    res.end();
		    }else{
			    res.redirect('/eve2/industry');
		    }
	    });
    });
  
  
    router.post('/eve2/designItemUse/', function(req,res){
        var mysql = req.app.get('mysql');
        var pilotable = false;
        if (req.body.type == "Ship") { pilotable = true; }

        var sql = queries.insert.insert_item_use;
        var inserts = [req.body.fromitemname,
                       pilotable,
                       req.body.capacity,
                       req.body.type];

        sql = mysql.pool.query(sql,inserts,function(error,results,fields){
            if(error){
                res.write("design item use post router says: " + JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/eve2/industry');
            }
        });
    });

    // remember later to assign new players to ships.
    // just making a character is enough for now.
    router.post('/newplayer/', function(req,res){
        var mysql = req.app.get('mysql');
        var sql = queries.insert.insert_player;
        var inserts = [req.body.name];
        sql = mysql.pool.query(sql,inserts,function(error,results,fields){
            if(error){
                res.write("new player post router says: " + JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/eve2/player');
            }
        });
    });

    return router;
})();

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

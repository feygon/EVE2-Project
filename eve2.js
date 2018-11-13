// default method export, overloading the get function with string cases.
module.exports = (function() {
    
    var express = require('express');
    var router = express.Router();
    var callbacks = require('./scripts/callbacks');
    var queries = require('./scripts/queries');
    var runtimeScripts = require('./scripts/runtimeScripts');
    

    /********************************************
     *
     *  Basic Get routes without callbacks      *
     * 
     *******************************************/

    function getComplete(res, count, renderString, callbackCount, context) {
        return function() {
            callbackCount++;
            if (callbackCount >= count){
                res.render(renderString, context);
            }
        }
    }

    /********************************
     *                              *
     *      DEFAULT ROUTER          *
     *                              *
     *******************************/
    router.get('/', function(req, res){
        /** example call to getSessionValues:
         * getSessionValues(req, res, mysql, context, complete);
         * Should be after mysql is instantiated, context is set,
         *  and should have access to a complete() function callback.
         */
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        res.render('homepage', context);
    });

    router.get('/player/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        var complete = getComplete(res, 1, 'player', callbackCount, context);

        // columns in all_players: playerID, playerName, playerShip,
        //  playerLocation, locationName, playerShipCSid
        callbacks.select.all_players(res, mysql, context, complete); // id, name, piloting_CS_id, locationID
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
        
        callbacks.select.item_structure_list(res, mysql, context, complete);
        callbacks.select.itemUse_list_orderbyqq(res, mysql, context, complete);
        callbacks.select.item_structure_types(res, mysql, context, complete);
        callbacks.select.item_use_scales(res, mysql, context, complete);
        callbacks.select.useless_item_structures(res, mysql, context, complete);
        console.log(context);
        //context.jsscripts = []; // no client-side scripts yet

        function complete(){
            callbackCount++;
        //    console.log("Callback " + callbackCount + " complete.");
            if (callbackCount >= 5){

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
    router.post('/out_in_space/', function(req,res){
        var mysql = req.app.get('mysql');
        var callbackCount = 0;
        var tag = "";
        var sql = "";
        var inserts = [];
        callbacks.getPostValues.out_in_space(req, res, tag, sql, inserts, complete);
        
        function complete(){
            callbackCount++;
            if (callbackCount >= 1){
                sql = mysql.pool.query(sql, inserts, function(error, results, fields){
                    if(error){
                        res.write("out_in_space(" + tag + ") post router tag says: " 
                            + JSON.stringify(error));
                        res.end();
                    }else{
                        res.redirect('/eve2/out_in_space');
                    }
                }); // end sql query anonymous error logging function
            } // end callbackCount check
        } // end complete
    });

    router.post('/player/', function(req, res){
        var mysql = req.app.get('mysql');
        var callbackCount = 0;
        var tag = {};
        var sql = {};
        var inserts = {};
        var context = {};
        callbacks.getPostValues.player(req, res, tag, sql, inserts, mysql, context, complete);

        function complete(){
            callbackCount++;
            if (callbackCount >= 1){
            console.log("1 player post callback completed. SQL = " + sql);

                sql = mysql.pool.query(sql.post, inserts.post, function(error, results, fields){
                    if(error){
                        res.write("player(" + tag.post + ") post router tag says: " 
                            + JSON.stringify(error));
                        res.end();
                    }else{
                        res.redirect('/eve2/player');
                    }
                }); // end sql query anonymous error logging function
            } // end callbackCount check
        } // end complete
    });


    router.post('/industry/inventstructure/', function(req,res){
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
  
  
    router.post('/industry/designitemuse/', function(req,res){
        var mysql = req.app.get('mysql');
        var pilotable = false;
        if (req.body.scale == "Ship") { pilotable = true; }

        var sql = queries.insert.insert_item_use;
        var inserts = [req.body.fromitemname,
                       pilotable,
                       req.body.capacity,
                       req.body.scale];

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

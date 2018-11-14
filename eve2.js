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

    function renderComplete(res, count, renderString, callbackCount, context) {
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
        var complete = renderComplete(res, 1, 'player', callbackCount, context);

        // columns in all_players: playerID, playerName, playerShip,
        //  playerLocation, locationName, playerShipCSid
        callbacks.select.all_players(res, mysql, context, complete); // id, name, piloting_CS_id, locationID
     });

    router.get('/space_station/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        var complete = renderComplete(
            res, 1, 'space_station', callbackCount, context);

        callbacks.session.checkSession(req, res, complete);
    });

    router.get('/out_in_space/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        var complete = renderComplete(
            res, 1, 'out_in_space', callbackCount, context); // increment if adding callbacks.

        callbacks.session.checkSession(req, res, complete);
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
        var complete = renderComplete(
            res, 6, 'industry', callbackCount, context); // increment if adding callbacks.

        //console.log("mysql3: " + mysql);
        callbacks.session.checkSession(req, res, context, complete);
        callbacks.select.item_structure_list(res, mysql, context, complete);
        callbacks.select.itemUse_list_orderbyqq(res, mysql, context, complete);
        callbacks.select.item_structure_types(res, mysql, context, complete);
        callbacks.select.item_use_scales(res, mysql, context, complete);
        callbacks.select.useless_item_structures(res, mysql, context, complete);
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
        var context = {};
        context.session = req.session;
        callbacks.post.out_in_space(req, res, tag, sql, inserts, complete);
        
        function complete(){
            callbackCount++;
            if (callbackCount == 1){
                callbacks.session.setSession(req, res, mysql, context, complete);
            }

            if (callbackCount >= 2){
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
        context.session = req.session;
        callbacks.post.player(req, res, tag, sql, inserts, mysql, context, complete);

        function complete(){
            callbackCount++;
            if (callbackCount == 1){
                callbacks.session.setSession(req, res, mysql, complete);
            }
            if (callbackCount >= 2){
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

    return router;
})(); // notice this is immediately called.
// This is a different kind of module expression.
// The module is being set to equal the return value of router,
    // after these .get and .post methods are called on it,
    // using the express.Router module, which was required at the top.
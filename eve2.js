// default method export, overloading the get function with string cases.
module.exports = (function() {
    
    var express = require('express');
    var router = express.Router();
    var callbacks = require('./scripts/callbacks');
    var queries = require('./scripts/queries');

    /*
    *   HandlerProgress_Get class
    *       Handles complete callback counting for asynchronous calls
    *       Affords two phases of calls, for 
    */
    class HandlerProgress_Get {
        constructor(renderString, callbackTotalCount, behavior, 
                    preCallbackTotalCount, preBehavior) {
            this.renderString = renderString;
            this.callbackTotalCount = callbackTotalCount;
            this.preCallbackTotalCount = preCallbackTotalCount;
            this.count = 0;
            this.precount = 0;
            this.behavior = behavior;
            this.prebehavior = preBehavior;

            this.complete = function(cbName) {
                this.count++;
                console.log(renderString + "'s callback " + cbName + " complete.\n"
                    + " CallbackCount = " + this.count + " / " + this.callbackTotalCount);
                if (this.count >= this.callbackTotalCount) {
                    console.log("---------------HandlerProgress_Get----------------");
                    this.behavior();
                }
            };

            this.incomplete = function(cbName) {
                this.precount++;
                console.log(this.renderString + "'s pre-loading callback " + cbName + " complete.\n"
                    + "PrecallbackCount = " + this.precount + " / " + this.preCallbackTotalCount);
                if (this.precount >= this.preCallbackTotalCount){
                    this.prebehavior();
                }
            };

            this.render = function(res, context) {
                res.render(this.renderString, context);
            };
        }
    }

    /********************************
     *      DEFAULT ROUTER          *
     *******************************/
    router.get('/', function(req, res){
        var context = {};
        context.counter = req.session.count;
        res.render('homepage', context);
    });


    router.get('/readMe/', function(req, res){
        var context = {};
        res.render('readme', context);
    });

    /********************************
    *       SESSION CHECKER         *
    ********************************/
    router.get('/player/', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        var renderString = 'player';
        let progress = new HandlerProgress_Get(renderString, 1, ready, 0, null);

        callbacks.select.all_players(res, mysql, context, progress); // id, name, piloting_CS_id, locationID

        function ready() {
            progress.render(res, context); 
        }
    });

    router.post('/player/', function(req, res) {
        var callerName = "player_post";
        var mysql = req.app.get('mysql');
        var callbackCount = 0;
        var tag = { };
        var sql = { };
        var inserts = { };
        var context = { };
        context = callbacks.pre.session.copySessionObjToContext(context, req.session, callerName);

        callbacks.post.player(req, res, tag, sql, inserts, mysql, complete);

        function complete(cbname) {
            console.log(cbname + " complete.");
            callbackCount++;
            if (callbackCount >= 1) {
                mysql.pool.query(sql.post, inserts.post, function(error, results, fields) {
                    if(error) {
                        res.write("player(" + tag.post + ") post router tag says: " 
                            + JSON.stringify(error));
                        res.end();
                    } else {
                        res.redirect('/eve2/player');
                    }
                }); // end sql query anonymous error logging function
            } // end callbackCount check
        } // end complete
    });


    router.all('*', function(req, res, next){
        var url = req.url;
        console.log("Navigating to " + url + "\n------router-all-/------");
        var check = callbacks.session.checkSession(req, res, url);
        if (check == true){
            next(); // session details valid. go to intended route handler.
        }
    });


    router.get('/out_in_space/', function(req, res){
        var callerName = "out_in_space";
        var context = {};
        var mysql = req.app.get('mysql');
        var renderString = 'out_in_space';

        context = callbacks.pre.session.copySessionObjToContext(
            context, req.session, callerName);

        let progress = new HandlerProgress_Get(renderString, 2, ready, 0, null);

	    /* callbacks go here. */
        callbacks.select.stations_in_space(res, req, mysql, context, progress);
        callbacks.select.linked_locations(res, req, mysql, context, progress);

        function ready() {
            // console.log("progress count is " + progress.count + " / " + progress.callbackTotalCount);
            // console.log("Ready called.-----------------------------------");
            // console.log("Ready's context reads: " + JSON.stringify(context) 
            //     + "\n--------------final context--------------");
            progress.render(res, context);
        }
    });

/*********************************good above here*************************************/

    router.get('/space_station/', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        var renderString = 'space_station';
        let progress = new HandlerProgress_Get(renderString, 0, ready, 0, null);
        ready();    // temporary for testing purposes.
        /* callbacks go here. */
        function ready() {
            progress.render(res, context); 
        }
    });


    router.get('/industry/', function(req, res){
        var renderString = "industry";
        var context = {};
        var mysql = req.app.get('mysql');
        let progress = new HandlerProgress_Get(renderString, 5, ready, 0, null);

        /* callbacks go here. */
        callbacks.select.item_structure_list(res, mysql, context, progress);
        callbacks.select.itemUse_list_orderbyqq(res, mysql, context, progress);
        callbacks.select.item_structure_types(res, mysql, context, progress);
        callbacks.select.item_use_scales(res, mysql, context, progress);
        callbacks.select.useless_item_structures(res, mysql, context, progress);

        function ready() {
            progress.render(res, context); 
        }
    });

    /************************************************
    *
    *       Post Routes w/ sql                      *
    *   
    ************************************************/
    
    // remember later to hook this up with 2 inserts to EVE2_LINKS.
    router.post('/out_in_space/', function(req,res){
        console.log("Posting to out in space");
        var mysql = req.app.get('mysql');
        var callbackCount = 0;
        var tag = {};
        var sql = {};
        var inserts = {};
        var context = {};
        context.session = req.session;
        callbacks.post.out_in_space(req, tag, sql, inserts, complete);
        // curious about tag left as "" and not {}. Will it work?
        
        function complete(cbName) {
            console.log(cbName + " complete.");
            callbackCount++;
            if (callbackCount >= 1) {
                console.log("querying: " + sql.post 
                + "with tag " + JSON.stringify(tag) 
                + " and inserts" + JSON.stringify(inserts.post));
                sql = mysql.pool.query(sql.post, inserts.post, function(error, results, fields){
                    if(error){
                        res.write("out_in_space(" + JSON.stringify(tag) + ") post router tag says: " 
                            + JSON.stringify(error));
                        res.end();
                    }else{
                        if (req.session.shipNest) {
                            console.log("Ship has docked. Redirecting post to get space station view.");
                            res.redirect('/eve2/space_station/');
                        } else {
                            console.log("Ship still in space. Redirecting post to get out in space view.");
                            res.redirect('/eve2/out_in_space/');
                        }
                    }
                }); // end sql query anonymous error logging function
            } // end callbackCount check
        } // end complete
    });



    router.post('/industry/inventstructure/', function(req,res){
        var callerName = "industry/inventstructure_post";
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
        var callerName = "industry/designitemuse_post";
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
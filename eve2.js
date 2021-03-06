

// default method export, overloading the get function with string cases.
module.exports = (function() {
    
    var express = require('express');
    var router = express.Router();
    var callbacks = require('./scripts/callbacks');

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
            this.timeout = true;
            // setTimeout(function(){ 
            //     if (this.timeout) {
            //         alert("Possible callback timeout condition or database is taking a while.");
            //     }
            // }, 5000);


            this.complete = function(cbName) {
                this.count++;
                console.log(renderString + "'s callback " + cbName + " complete.\n"
                    + " CallbackCount = " + this.count + " / " + this.callbackTotalCount);
                if (this.count >= this.callbackTotalCount) {
                    console.log("---------------HandlerProgress_Get----------------");
                    // this.timeout = false;
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
                // console.log(" Context at render time reads:\n" + JSON.stringify(context)
                // + "\n---------render context------------");
                console.log("Rendering " + renderString + "\n--------------rendering----------------");
                res.render(this.renderString, context);
            };
        }
    }

    /********************************
     *      DEFAULT ROUTER          *
     *******************************/
    router.get('/', function(req, res) {
        var context = {};
        context.jsscripts = ["constraints.js"];
        context = callbacks.pre.session.copySessionObjToContext(
            context, req.session);
        context.counter = req.session.count;
        res.render('homepage', context);

        var hbs = req.app.get('hbs');
        console.log("helpers reads: " + JSON.stringify(hbs['helpers']) + "\n----end----");
        // hbs.helpers.comparison.comparison();
    });


    router.get('/readMe/', function(req, res) {
        var context = {};
        res.render('readme', context);
    });

    /********************************
    *       SESSION CHECKER         *
    ********************************/
    router.get('/player/', function(req, res) {
        var context = {};
        context.jsscripts = ["constraints.js"];
        context = callbacks.pre.session.copySessionObjToContext(
            context, req.session);
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
        context.jsscripts = ["constraints.js"];
        context = callbacks.pre.session.copySessionObjToContext(
            context, req.session);

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


    router.all('*', function(req, res, next) {
        var url = req.url;
        console.log("Navigating to " + url + "\n------router-all-/------");
        var check = callbacks.session.checkSession(req, res, url);
        if (check == true){
            next(); // session details valid. go to intended route handler.
        }
    });

    router.get('/operations/', function(req, res) {
        console.log("operations handler called.")
        if (req.session.shipNest) {
            res.redirect('/eve2/space_station/');
        } else {
            res.redirect('/eve2/out_in_space/');
        }
    });

    router.get('/out_in_space/:pr', function(req,res) {
        console.log("\n----parameter handler----\n")
        var callerName = "out_in_space";
        var mysql = req.app.get('mysql');
        var renderString = 'out_in_space:/pr';
        let progress = new HandlerProgress_Get(renderString, 1, ready, 0, null); 
        callbacks.procedure_call.undockShip(
            res, req, mysql, callerName, progress);
        function ready() {
            res.redirect('/eve2/out_in_space')
        }
    });

    router.get('/out_in_space/', function(req, res) {
        console.log("\n----main handler----\n")
        var callerName = "out_in_space";
        var context = {};
        context.jsscripts = ["constraints.js"];
        var mysql = req.app.get('mysql');
        var renderString = 'out_in_space';

        context = callbacks.pre.session.copySessionObjToContext(
            context, req.session);
        let progress = new HandlerProgress_Get(renderString, 4, ready, 0, null);

	    /* callbacks go here. */
        callbacks.select.stations_in_space(res, req, mysql, context, progress);
        callbacks.select.linked_locations(res, req, mysql, context, progress);
        callbacks.select.allLocations(res, mysql, context, progress);
        callbacks.monolithic.getCargo_Deep(res,req,mysql,context,"Ship", progress);

        function ready() {
            console.log("Ready?");
            // console.log("progress count is " + progress.count + " / " + progress.callbackTotalCount);
            // console.log("Ready called.-----------------------------------");
            // console.log("Ready's context reads: " + JSON.stringify(context) 
            //     + "\n--------------final context--------------");
            callbacks.pre.session.copySessionObjToContext(context, req.session);
            progress.render(res, context);
        }
    });

    router.get('/space_station/:by', function(req, res) {
        var context = {};
        context = callbacks.pre.session.copySessionObjToContext(
            context, req.session);
        context.jsscripts = ["constraints.js"];
        context.filter_by = req.params.by;
            var mysql = req.app.get('mysql');
        var renderString = 'space_station';
        let progress = new HandlerProgress_Get(renderString, 2, ready, 0, null);

        console.log("------------------Testing filter---------------")

        callbacks.select.all_players(res, mysql, context, progress);
        callbacks.monolithic.getCargo_Deep(
            res,req,mysql,context,"Station", progress, req.params.by);

        function ready() {
            console.log("------------------Testing filter ready---------------")
            if (req.session.alertMsg) {
                context.sessionAlert = req.session.alertMsg;
                req.session.alertMsg = null;
            }
            callbacks.pre.session.copySessionObjToContext(context, req.session);
            progress.render(res, context); 
        }
    });

    router.get('/space_station/', function(req, res) {
        var context = {};
        context = callbacks.pre.session.copySessionObjToContext(
            context, req.session);
        context.jsscripts = ["constraints.js"];
        var mysql = req.app.get('mysql');
        var renderString = 'space_station';
        let progress = new HandlerProgress_Get(renderString, 2, ready, 0, null);
        var readyCount = 0;

        callbacks.select.all_players(res, mysql, context, progress);
        callbacks.monolithic.getCargo_Deep(res,req,mysql,context,"Station", progress);

        function ready() {
            readyCount++;
            if (readyCount == 1){
                console.log("\nResetting session.\n")
                callbacks.session.setSession(req, res, req.session.playerID, mysql, ready);
            }
            if (readyCount == 2){
                if (req.session.alertMsg) {
                    context.sessionAlert = req.session.alertMsg;
                    req.session.alertMsg = null;
                }
                callbacks.pre.session.copySessionObjToContext(context, req.session);
                progress.render(res, context); 
            }
        }
    });


    router.get('/industry/', function(req, res) {
        var callerName = "industry";
        var renderString = "industry";
        var context = {};
        context = callbacks.pre.session.copySessionObjToContext(
            context, req.session, callerName);
        context.jsscripts = ["constraints.js"];
        var mysql = req.app.get('mysql');
        let progress = new HandlerProgress_Get(renderString, 5, ready, 0, null);
        // console.log("industry req.session reads" + JSON.stringify(req.session));

        /* callbacks go here. */
        callbacks.select.item_structure_list(res, mysql, context, progress);
        callbacks.select.itemUse_list_orderbyq(res, mysql, context, progress);
        callbacks.select.item_structure_types(res, mysql, context, progress);
        callbacks.select.item_use_scales(res, mysql, context, progress);
        callbacks.select.useless_item_structures(res, mysql, context, progress);

        if (req.session.alertMsg) {
            context.sessionAlert = req.session.alertMsg;
            req.session.alertMsg = null;
        }
        function ready() {
            callbacks.pre.session.copySessionObjToContext(context, req.session);
            progress.render(res, context); 
        }
    });

    /************************************************
    *
    *       Post Routes w/ sql                      *
    *   
    ************************************************/
    
    // remember later to hook this up with 2 inserts to EVE2_LINKS.
    router.post('/out_in_space/', function(req,res) {
        console.log("Posting to out in space");
        var mysql = req.app.get('mysql');
        var callbackCount = 0;
        var tag = {};
        var sql = {};
        var inserts = {};
        var context = {};
        context.session = req.session;
        callbacks.post.out_in_space(req, mysql, tag, sql, inserts, complete);
        // curious about tag left as "" and not {}. Will it work?
        
        function complete(cbName) {
            console.log(cbName + " complete.");
            callbackCount++;
            if (callbackCount >= 1) {
                console.log("querying: " + sql.post 
                + "with tag " + JSON.stringify(tag) 
                + " and inserts" + JSON.stringify(inserts.post));
                mysql.pool.query(sql.post, inserts.post, function(error, results, fields){
                    if(error){
                        res.write("out_in_space(" + JSON.stringify(tag) + ") post router tag says: " 
                            + JSON.stringify(error));
                        res.end();
                    }else{
                        if (req.session.shipNest) {
                            console.log("Ship has docked. Redirecting post to get space station view.");
                            res.redirect('/eve2/space_station/');
                        } else if (req.body['moveLocation']){
                            callbacks.session.setSession(req, res, req.session.playerID, mysql, done);
                        } else { 
                            done();
                        }
                    }
                }); // end sql query anonymous error logging function
            } // end callbackCount check
        } // end complete
        function done() {
            console.log("Ship still in space. Redirecting post to get out in space view.");
            res.redirect('/eve2/out_in_space/');
        }
    });

    router.post('/industry/', function(req,res) {
        var mysql = req.app.get('mysql');
        var sql = {};
        var inserts = {};
        var tag = {};
        callbacks.post.industry(req, tag, sql, inserts);

        mysql.pool.query(sql.post, inserts.post, function(error, results, fields) {
            if(error){
                res.write(tag.post + "-tagged industry post says: "
                    + JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/eve2/industry');
            }
        });
    });

    router.post('/space_station/', function(req,res) {
        var mysql = req.app.get('mysql');
        var sql = {};
        var inserts = {};
        var tag = {};
        var completeCount = 0;

        callbacks.post.space_station(res, req, mysql, tag, sql, inserts, complete);

        function complete() {
            completeCount++;
            // call whatever the post callback says to
            if (completeCount == 1) {
                mysql.pool.query(sql.post, inserts.post, function(error, results, fields) {
                    if(error){
                        res.write(tag.post + "-tagged space_station post says: "
                            + JSON.stringify(error));
                        res.end();
                    } else {
                        complete();
                    }
                });
            }
            // then, set the session details to the new data.
            if (completeCount == 2) {
                callbacks.session.setSession(req, res, req.session.playerID, mysql, allDone);
            } 
        }
        function allDone(){
            res.redirect('/eve2/space_station');
        }
    });

    return router;
})(); // notice this is immediately called.
// This is a different kind of module expression.
// The module is being set to equal the return value of router,
    // after these .get and .post methods are called on it,
    // using the express.Router module, which was required at the top.
// class HandlerProgress_Get {
// 	constructor(renderString, callbackTotalCount, behavior, 
// 			preCallbackTotalCount, preBehavior){
// 		this.renderString = renderString;
// 		this.callbackTotalCount = callbackTotalCount;
// 		this.preCallbackTotalCount = preCallbackTotalCount;
// 		this.count = 0;
// 		this.precount = 0;
// 		this.behavior = behavior;
// 		this.prebehavior = preBehavior;

// 		this.incomplete = function(cbName){
// 			this.precount++;
// 			console.log(this.renderString + "'s pre-loading callback " + cbName + " complete.\n"
// 				+ "PrecallbackCount = " + this.precount + " / " + this.preCallbackTotalCount);
// 			if (this.precount >= this.preCallbackTotalCount){
// 				prebehavior();
// 			}
// 		};
// 		this.complete = function(cbName){
// 			this.count++;
// 			console.log(renderString + "'s callback " + cbName + " complete.\n"
// 				+ " CallbackCount = " + this.count + " / " + this.callbackTotalCount
// 				+ "\n---------------HandlerProgress_Get----------------");
// 			if (this.count >= this.callbackTotalCount) {
// 				behavior();
// 			}
// 		};
// 		this.render = function(res, context){
// 			res.render(this.renderString, context);
// 		};
// 	}
// }


var callbacks = {};
callbacks.select = {};
callbacks.post = {};
callbacks.session = {};
callbacks.delete = {};
callbacks.insert = {};
callbacks.pre = {};
callbacks.pre.session = {};
callbacks.pre.session.copySessionObjToContext = {};
callbacks.session.setSession = {};
callbacks.session.checkSession = {};
callbacks.session.clearSessionData = {};
callbacks.select.item_structure_list = {}; 		// id, name, type
callbacks.select.item_structure_types = {}; 	// type
callbacks.select.item_use_scales = {}; 			// scale
callbacks.select.itemUse_list_orderbyq = {};	// name, id, pilotable, capacity, scale
callbacks.select.objects_in_CS = {};			// 
callbacks.select.useless_item_structures = {}; 	// id, name, type
callbacks.select.ship_in_space = {};
callbacks.select.stations_in_space = {};
callbacks.select.linked_locations = {}
callbacks.select._session_player = {};
callbacks.delete.del_object = {};
callbacks.insert.insert_object = {};			// itemStructure_id, cargoSpace_id, quantity, packaged
callbacks.post.out_in_space = {};				// id, name, type, vol_packed, vol_unpacked, qty, packaged
callbacks.post.player = {};

//console.log("parsing callbacks.js");
var queries = require('./queries');
var monoCBs = require('./monoCBs.js');

// don't use w/ req as context.
callbacks.pre.session.copySessionObjToContext = 
function copySessionToContext(context, obj){
	context.session = {};
	context.session.playerID = obj.playerID;
	context.session.playerName = obj.playerName;
	context.session.shipID = obj.shipID;
	context.session.shipNest = obj.shipNest;
	context.session.shipName = obj.shipName;
	context.session.locationID = obj.locationID;
	context.session.locationName = obj.locationName;
	return context;
};

callbacks.session.setSession =
function setSession(req, res, playerID, mysql, complete) {
	var cbName = "callbacks.session.setSession";
	// console.log("------Setting session------");
	var subcompleteCount = 0;
	var subcontext = {};
	subcontext.playerID = playerID;
	// console.log("subcontext playerID: " + subcontext.playerID);
	callbacks.select._session_player(res, mysql, subcontext, subcomplete);

	function subcomplete(){
		subcompleteCount++;
		if (subcompleteCount >= 1){
			// console.log("-------------SetSession says: \n" + 
			// 	"external subcontext: " + JSON.stringify(subcontext.session_player));
			req.session.playerID = subcontext.session_player[0].playerID;
			req.session.playerName = subcontext.session_player[0].playerName;
			req.session.shipID = subcontext.session_player[0].shipID;
			req.session.shipNest = subcontext.session_player[0].shipNest;
			req.session.shipName = subcontext.session_player[0].shipName;
			req.session.locationID = subcontext.session_player[0].locationID;
			req.session.locationName = subcontext.session_player[0].locationName;
			req.session.count = 0;
			console.log("SetSession says: \n" +
				"req.session in setsession is " + JSON.stringify(req.session)
				+ "\n-----------------------------------------------");
			complete(cbName);
		}
	}
};

callbacks.session.checkSession = 
function checkSession(req, res, caller) {
	if (!req.session || !req.session.playerID || req.session.playerID == null ) {
		console.log("Session destroyed by " + caller);
		req.session.destroy();
		res.redirect('/eve2/player');
		return false;
	} else {
		console.log("Good session. Continuing to " + caller);
		return true;
	}
};

callbacks.select.all_players =
function all_players(res, mysql, context, complete) {
	var cbName = "callbacks.select.all_players";
	var sql = "";
	// columns: playerID, playerName, playerShip, playerLocation, locationName, playerShipCSid
	sql += queries.select.all_players;
	var inserts = ["playerName", "asc"];

	mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error){
			res.write("callback.select.all_players returns: " + JSON.stringify(error));
			res.end();
		}
		context.all_players = results;
		complete.complete(cbName);
	});
};

// column names: id, name, type
callbacks.select.item_structure_list = 
function item_structure_list(res, mysql, context, complete) {
	var cbName = "callbacks.select.item_structure_list";
//	console.log("calling back item list");
	var sql = "";
	sql += queries.select.item_structure_list;
	
	//no inserts
	mysql.pool.query(sql, function(error, results, fields){
		if(error){
			res.write("callback.select.item_structure_list returns: " + JSON.stringify(error));
			res.end();
		}
		context.item_structure_list = results;
		complete(cbName);
	});
};

// column names: type
callbacks.select.item_structure_types = 
function item_structure_types(res, mysql, context, complete) {
	var cbName = "callbacks.select.item_structure_types";
	var sql = "";
	sql += queries.select.item_structure_types;

	mysql.pool.query(sql, function(error, results, fields) {
		if(error){
			res.write("callback.select.item_structure_types returns: " + JSON.stringify(error));
			res.end();
		}
		context.item_structure_types = results;
		complete(cbName);
	});
};

// column names: scale
callbacks.select.item_use_scales = 
function item_use_scales(res, mysql, context, complete) {
	var cbName = "callbacks.select.item_use_scales";
	var sql = "";
	sql += queries.select.item_use_scales;

	mysql.pool.query(sql, function(error, results, fields) {
		if(error){
			res.write("callback.select.item_use_scales returns: " + JSON.stringify(error));
			res.end();
		}
		context.item_use_scales = results;
		complete(cbName);
	});
};

// column names: name, id, pilotable, capacity, scale
callbacks.select.itemUse_list_orderbyqq = 
function itemUse_list_orderbyqq(res, mysql, context, complete) {
	var cbName = "callbacks.select.itemUse_list_orderbyqq";
	var sql = "";
	sql += queries.select.itemUse_list_orderbyqq;
	var inserts = ['name'];
	
	sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
		if(error){
			res.write("callback.select.itemUse_list_orderbyqq returns: " + JSON.stringify(error));
			res.end();
		}
		context.itemUse_list_orderbyqq = results;
		complete(cbName);
	});
};

// column names: id, name, type
callbacks.select.useless_item_structures = 
function useless_item_structures(res, mysql, context, complete) {
	var cbName = "callbacks.select.useless_item_structures";
//	console.log("calling back non container objects");
	var sql = "";
	sql += queries.select.useless_item_structures;

	mysql.pool.query(sql, function(error, results, fields) {
		if(error){
			res.write("callback.select.useless_item_structures returns: " + JSON.stringify(error));
			res.end();
		}
		context.useless_item_structures = results;
		complete(cbName);
	});
};


callbacks.select._session_player = 
function session_player(res, mysql, subcontext, subcomplete) {
	var cbName = "callbacks.select.session_player";
	// console.log("------session_player sql callback------- ")
	var sql = "";
	sql += queries.select.session_player;
	var inserts = [subcontext.playerID];

	// console.log("mysql.pool.query receiving query: \n" 
		// + sql + "\n"
		// + "and inserts from subcontext: " + JSON.stringify(subcontext));

	mysql.pool.query(sql, inserts, function(error, results, fields) {
		if(error){
			res.write("callbacks.select.session_player returns: "
				+ JSON.stringify(error) + "\n----------------------------");
			res.end;
		}
		subcontext.session_player = results;
		// console.log("subcontext.session_player ought to be returning: \n"
		// + JSON.stringify(subcontext.session_player));
		subcomplete();
	});
};


callbacks.select.ship_in_space = 
function ship_in_space(res, req, mysql, context, complete) {
	var cbName = "callbacks.select.ship_in_space";
//	console.log("_________________________\nIMPLEMENT ME!\ncallbacks.select.ship_in_space\n\n");
	var stepCtr = 0;
	// stored procedure to generate:
	//	objects in cargo spaces ordered by cargo space id
	//	parse 
	var sql1 = queries.procedure_call.SP_getShipAndBoxes;
	var sql2 = queries.procedure_call.SP_getObjectsInCSView;
	var inserts = [req.session.shipID]; //not yet implemented.
	var inserts2 = ["view_ShipAndBoxes_CSs"]; // just a guess what the view would be named.

	mysql.pool.query(sql, inserts, function(error, results, fields) {
		if(error){
			res.write("first query from callbacks.select.ship_in_space says:\n"
				+ JSON.stringify(error));
			res.end;
		}
		context.CargoSpaces_in_CargoSpace_deep = results;
		step(); 
	});

	mysql.pool.query(sql2, inserts2, function(error, results, fields) {
		if(error){
			res.write("first query from callbacks.select.ship_in_space says:\n"
				+ JSON.stringify(error));
			res.end;
		}
		context.objects_in_listed_cargoSpaces = results;
		step();
	});

	function step() {
			stepCtr++;
			if (stepCtr >= 2) {

			// do stuff to arrays to make context... contextual.

			complete(cbName);
		}
	}
};

// columns: stationID, stationName
callbacks.select.stations_in_space = 
function stations_in_space(res, req, mysql, context, complete) {
	var cbName = "callbacks.select.stations_in_space";
	var sql = "";

	sql += queries.select.stations_in_space;
//	console.log("req.session accessed by callbacks.select.stations_in_space reads: "
//		+ JSON.stringify(req.session) + "\n--------------------------");

	var inserts = [req.session.shipID]; // check order of '?'s
	mysql.pool.query(sql, inserts, function(error, results, fields) {
		if(error) {
			res.write("callbacks.select.stations_in_space says:\n"
				+ JSON.stringify(error));
			res.end;
		}
//		console.log("setting stations_in_space to results:" + JSON.stringify(results)
//		 + "\n---------------------");
		context.stations_in_space = results;
//		console.log("context set by stations_in_space CB.");
		complete.complete(cbName);
	});
};

// columns: id, name
callbacks.select.linked_locations = 
function linked_locations(res, req, mysql, context, complete) {
	var cbName = "callbacks.select.linked_locations";
	var sql = "";
	sql += queries.select.linked_locations;
	var inserts = [req.session.locationID];
	// console.log("Sql query is: " + sql 
	// 	+ "\n... and inserts is " + req.session.locationID);

	mysql.pool.query(sql, inserts, function(error, results, fields) {
		if(error) {
			res.write("callbacks.select.linked_locations says: " 
				+ JSON.stringify(error) + "\n---------------------");
			res.end;
		}
		// console.log("setting context.linked_locations to results:" 
		// 	+ JSON.stringify(results) + "\n---------------------");
		context.linked_locations = results;
		// console.log("context set by linked_locations CB");
		complete.complete(cbName);
	});
};

// itemStructure_id, cargoSpace_id, quantity, packaged
callbacks.insert.insert_object = 
function insert_object(res, mysql, context, complete) {
	var cbName = "callbacks.insert.insert_object";
	var sql = "";
	sql += queries.insert.insert_object;
	var inserts = [context.itemStructure_id, 
				   context.cargoSpace_id, 
				   context.quantity, 
				   context.packaged];
	mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error){
			res.write(cbName + " says: " + JSON.stringify(error) + "\n^^^^error^^^^");
			res.end;
		}
		// nothing to add to context.
		complete.complete(cbName);
	});
};

callbacks.delete.del_object = 
function del_object(res, mysql, context, complete) {
	var cbName = "callbacks.delete.del_object";
	var sql = "";
	sql += queries.delete.del_object;
	var inserts = [context.objectToDelete];

	mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error) {
			res.write("callbacks.delete.del_object returns: "
				+ JSON.stringify(error) + "\n---------------------------");
			res.end;
		}
		complete(cbName);
	});
};

callbacks.post.out_in_space = 
function out_in_space(req, tag, sql, inserts, complete) {
	var cbName = "callbacks.post.out_in_space";
	console.log("callbacks.post.out_in_space receives session details:\n"
		+ JSON.stringify(req.session) + "\n--------cb-p-ois-req.session--------")
	if (req.body['annihilate']) {
        // query not yet written. Plan for body to get location extrapolated from session player tho.
		sql.post = queries.delete.del_link;
		inserts.post = [req.session.locationID, req.body.wormhole_id, // here, there,
						req.body.wormhole_id, req.session.locationID];// there, here.
		tag.post = 'Annihilate';
	}
	if (req.body['jettison']) {
		sql.post = queries.delete.del_object;
		inserts = [req.body.objectID];
		tag.post = 'Jettison';
	}
	if (req.body['moveLocation']) {
		sql.post = queries.update.set_location +
		"; " + queries.update.set_location_selection +
		"(SELECT CSid FROM(" + queries.select.cargoSpaceIDs_in_CargoSpace +
		") );";
		// double check session names when set up boilerplate session callback.
		inserts.post = [req.body.locationID, req.session.shipID, 
						req.body.locationID, req.session.shipID];
		tag.post = 'Travel';
	}
	if (req.body['chartWormhole']) {
		sql.post = queries.insert.insert_location;
		inserts.post = [req.session.locationID, req.body.name, req.body.Security];
		tag.post = 'chartWormhole';
	}
	if (req.body['dock']) {
		sql.post = queries.procedure_call.docking;
		inserts.post = [req.session.shipID, req.body.stationCSid];
		req.session.shipNest = req.body.stationCSid;
		tag.post = 'Dock';
	}
	complete(cbName);
};


callbacks.post.player = 
function player(req, res, tag, sql, inserts, mysql, complete) {
	var cbName = "callbacks.post.player";

	console.log("callbacks.post.player req.body = " + JSON.stringify(req.body));

	if (req.body['UsePlayer']){
		// console.log("UsePlayer post invoked.------");
		var doneCount = 0;
		var playerID = req.body.playerID;
		
		callbacks.session.setSession(req, res, playerID, mysql, done);
		function done() {
			console.log("session details in callbacks.post.player after setSession call: "
			+ JSON.stringify(req.session));
			doneCount++;
			if (doneCount >= 1) {
				if (!req.session.shipNest) { // if nothing returned here.
					console.log("callbacks.post.player says: \n" 
						+ "Session set. Redirecting to /eve2/out_in_space/"
						+ "\n-------------end post.player----------------");
					res.redirect('/eve2/out_in_space/');
				} else {
					console.log("callbacks.post.player says: \n" 
						+ "Session set. Redirecting to /eve2/space_station/"
						+ "\n--------------end post.player---------------");
					res.redirect('/eve2/space_station/');
				}
			}
		}
	}
	if (req.body['AddPlayer']) {
		// console.log("AddPlayer post invoked.");
		sql.post = queries.insert.insert_player;
		tag.post = 'AddPlayer';
		inserts.post = [req.body.name];
		// console.log("AddPlayer post values mutated.");
		complete(cbName);
	}
	if (req.body['DeletePlayer']) {
		// console.log("DeletePlayer post invoked.");
		sql.post = queries.delete.del_player;
		inserts.post = [req.body.playerID];
		tag.post = 'DeletePlayer';
		complete(cbName);
	}
};

module.exports = callbacks;
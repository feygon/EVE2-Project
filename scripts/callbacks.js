var callbacks = {};
callbacks.select = {};
callbacks.post = {};
callbacks.session = {};
callbacks.session.setSession = {};
callbacks.session.checkSession = {};
callbacks.session.clearSessionData = {};
callbacks.select.item_structure_list = {}; 		// id, name, type
callbacks.select.item_structure_types = {}; 	// type
callbacks.select.item_use_scales = {}; 			// scale
callbacks.select.itemUse_list_orderbyq = {};	// name, id, pilotable, capacity, scale
callbacks.select.useless_item_structures = {}; 	// id, name, type
callbacks.post.out_in_space = {};
callbacks.post.player = {};

//console.log("parsing callbacks.js");
var queries = require('./queries');

// don't use w/ req as context.
callbacks.session.copySessionObjToContext = 
function copySessionToContext(context, obj){
	context.session = {};
	context.session.playerID = obj.playerID;
	context.session.playerName = obj.playerName;
	context.session.CSid = obj.CSid;
	context.session.CSnest = obj.CSnest;
	context.session.locationID = obj.locationID;
	context.session.locationname = obj.locationName;
	return context;
};

callbacks.session.setSession = 
function setSession(req, res, playerID, mysql, done){
	console.log("------Setting session------");
	var subcompleteCount = 0;
	var sql = "";
	var inserts = [];
	var subcontext = {};
	subcontext.playerID = playerID;
	console.log("subcontext playerID: " + subcontext.playerID);
	callbacks.select.session_player(res, mysql, subcontext, subcomplete);

	function subcomplete(){
		subcompleteCount++;
		if (subcompleteCount >= 1){
			console.log("-------------SetSession says: \n" + 
				"external subcontext: " + JSON.stringify(subcontext.session_player));
			req.session.playerID = subcontext.session_player[0].playerID;
			req.session.playerName = subcontext.session_player[0].playerName;
			req.session.CSid = subcontext.session_player[0].CSid;
			req.session.CSnext = subcontext.session_player[0].CSnest;
			req.session.locationID = subcontext.session_player[0].locationID;
			req.session.locationname = subcontext.session_player[0].locationName;
			console.log("SetSession says: \n" +
				"req.session in setsession is " + JSON.stringify(req.session)
				+ "\n-----------------------------------------------");
			done();
		}
	}
};

callbacks.session.checkSession = 
function checkSession(req, res, complete){
	var doneCounter = 0;
	console.log("Checking req.session in checkSession:\n req.session.playerID = " 
		+ req.session.playerID);
	if (!req.session.playerID){
		req.session.destroy();
		console.log("Session not set. Redirecting to login page.");
		res.redirect('/eve2/player');
	} else {
		complete();
	}
};

callbacks.select.all_players =
function all_players(res, mysql, context, complete){
	var sql = "";
	// columns: playerID, playerName, playerShip, playerLocation, locationName, playerShipCSid
	sql += queries.select.all_players;
	var inserts = ["playerName"];

	mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error){
			res.write("callback.select.all_players returns: " + JSON.stringify(error));
			res.end();
		}
		context.all_players = results;
		complete();
	});
};

// column names: id, name, type
callbacks.select.item_structure_list = 
function item_structure_list(res, mysql, context, complete){
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
		complete();
	});
};

// column names: type
callbacks.select.item_structure_types = 
function item_structure_types(res, mysql, context, complete){
	var sql = "";
	sql += queries.select.item_structure_types;

	mysql.pool.query(sql, function(error, results, fields){
		if(error){
			res.write("callback.select.item_structure_types returns: " + JSON.stringify(error));
			res.end();
		}
		context.item_structure_types = results;
		complete();
	});
};

// column names: scale
callbacks.select.item_use_scales = 
function item_use_scales(res, mysql, context, complete){
	var sql = "";
	sql += queries.select.item_use_scales;

	mysql.pool.query(sql, function(error, results, fields){
		if(error){
			res.write("callback.select.item_use_scales returns: " + JSON.stringify(error));
			res.end();
		}
		context.item_use_scales = results;
		complete();
	});
};

// column names: name, id, pilotable, capacity, scale
callbacks.select.itemUse_list_orderbyqq = 
function itemUse_list_orderbyqq(res, mysql, context, complete){
	var sql = "";
	sql += queries.select.itemUse_list_orderbyqq;
	var inserts = ['name'];
	
	sql = mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error){
			res.write("callback.select.itemUse_list_orderbyqq returns: " + JSON.stringify(error));
			res.end();
		}
		context.itemUse_list_orderbyqq = results;
		complete();
	});
};

// column names: id, name, type
callbacks.select.useless_item_structures = 
function useless_item_structures(res, mysql, context, complete) {
//	console.log("calling back non container objects");
	var sql = "";
	sql += queries.select.useless_item_structures;

	mysql.pool.query(sql, function(error, results, fields){
		if(error){
			res.write("callback.select.useless_item_structures returns: " + JSON.stringify(error));
			res.end();
		}
		context.useless_item_structures = results;
		complete();
	});
};

callbacks.select.session_player = 
function session_player(res, mysql, subcontext, subcomplete){
	console.log("------session_player sql callback------- ")
	var sql = "";
	sql += queries.select.session_player;
	var inserts = [subcontext.playerID];

	console.log("mysql.pool.query receiving query: \n" 
		+ sql + "\n"
		+ "and inserts from subcontext: " + JSON.stringify(subcontext));

	mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error){
			res.write("callbacks.select.session_player returns: "
				+ JSON.stringify(error) + "\n----------------------------");
			res.end;
		}
		subcontext.session_player = results;
		console.log("subcontext.session_player ought to be returning: \n"
		+ JSON.stringify(subcontext.session_player));
		subcomplete();
	});
};

callbacks.post.out_in_space = 
function out_in_space(req, tag, sql, inserts, complete){
	if (req.body['annihilate']) {
        // query not yet written. Plan for body to get location extrapolated from session player tho.
		sql = queries.delete.del_link;
		inserts = [req.session.locationID, req.body.wormhole_id];
		tag = 'Annihilate';
	}
	if (req.body['jettison']) {
		sql = queries.delete.del_object;
		inserts = [req.body.objectID];
		tag = 'Jettison';
	}
	if (req.body['moveLocation']) {
		sql = queries.update.set_location +
		"; " + queries.update.set_location_selection +
		"(SELECT CSid FROM(" + queries.select.cargoSpaceIDs_in_CargoSpace +
		") );";
		// double check session names when set up boilerplate session callback.
		inserts = [req.body.locationID, req.session.CSid, 
				req.body.locationID, req.session.CSid];
		tag = 'Travel';
	}
	if (req.body['wormhole']) {
		sql = queries.insert.insert_location;
		inserts = [req.body.name, req.body.Security];
		tag = 'Wormhole';
	}
	if (req.body['dock']) {
		sql = queries.update.set_inside_of;
		// double check session names when set up boilerplate session callback.
		inserts = [req.body.stationCSid, req.session.CSid];
		tag = 'Dock';
	}
	complete();
};


callbacks.post.player = 
function player(req, res, tag, sql, inserts, mysql, context, complete){

	console.log(req.body);

	if (req.body['UsePlayer']){
		console.log("UsePlayer post invoked.------");
		var doneCount = 0;
		// set up session data.
		context.session.playerID = req.body.playerID;
		var playerID = req.body.playerID;
		console.log("callbacks.post.player says: \n" +
			"context.session.playerID is " + context.session.playerID);
		
		callbacks.session.setSession(req, res, playerID, mysql, done);
		
		function done(){
			doneCount++;
			if (doneCount >= 1){
				if (context.session.CSnest == "NULL"){
					console.log("callbacks.post.player says: \n" +
						"Session set. Redirecting to /eve2/out_in_space/");
					res.redirect('/eve2/out_in_space/');
				} else {
					console.log("callbacks.post.player says: \n" +
						"Session set. Redirecting to /eve2/space_station/\n"
					+ "Req.session is: " + JSON.stringify(req.session));
					res.redirect('/eve2/space_station/');
				}
			}
		}
	}
	if (req.body['AddPlayer']){
		console.log("AddPlayer post invoked.");
		sql.post = queries.insert.insert_player;
		tag.post = 'AddPlayer';
		inserts.post = [req.body.name];
		console.log("AddPlayer post values mutated.");
		complete();
	}
	if (req.body['DeletePlayer']){
		console.log("DeletePlayer post invoked.");
		sql.post = queries.delete.del_player;
		inserts.post = [req.body.playerID];
		tag.post = 'DeletePlayer';
		complete();
	}
};

module.exports = callbacks;
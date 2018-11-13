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

callbacks.session.setSession = 
function setSession(req, res, mysql, context, done){
	console.log(context);
	var sql = "";
	var finishedCount = 0;
	var inserts = [];
	var playerID = context.session.playerID;
	context.session = {};

	sql = queries.select.session_player;
	inserts = [playerID];

	mysql.pool.query(sql, function(error, results, fields){
		if (error){
			res.write("session.setSession returns: " + JSON.stringify(error));
			res.end();
		}
		context.session = results;
		done();
	});
};

callbacks.session.checkSession = 
function checkSession(req, res, context, complete){
	var doneCounter = 0;
	if (!req.session.playerID){
		callbacks.session.clearSessionData(req, done);

		function done(){
			doneCounter++;
			if (doneCounter >= 1){
				res.render('player', context);
			}
		}
	} else {
		context.session = req.session;	// continuity based on player id.
		complete();
	}
};

// GP CB encapsulation.
callbacks.session.clearSessionData = 
function clearSessionData(req, complete){
	req.session = {};
	complete();
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
		console.log("UsePlayer post invoked.");
		var doneCount = 0;
		// set up session data.
		console.log(req.body.playerID);
		context.session = {};
		context.session.playerID = {};
		context.session.playerID = req.body.playerID;

		console.log("playerIDb is " + context.session.playerID);
		
		callbacks.session.setSession(req, res, mysql, context, done);

		function done(){
			doneCount++;
			if (doneCount >= 1){
				if (context.session.CSnest == "NULL"){
					nevermind();
					res.render('out_in_space');
				} else {
					nevermind();
					res.render('space_station');
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
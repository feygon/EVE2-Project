var callbacks = {};

//console.log("parsing callbacks.js");
var queries = require('./queries');

// select queries to get a list of ids and names from structures.
callbacks.item_structure_list = 
function item_structure_list(res, mysql, context, complete){
//	console.log("calling back item list");
	var sql = "";
	sql += queries.select.item_structure_list;
	

//	console.log("mysql2: " + mysql);
	//no inserts
	mysql.pool.query(sql, function(error, results, fields){
		if(error){
			res.write("callback item_structure_list returns: " + JSON.stringify(error));
			res.end();
		}
		context.item_structure_list = results;
//		console.log("Results:\n" + JSON.stringify(results) + "\nResults end.");
//		console.log("Done printing results.");
		complete();
	});
};

callbacks.item_structure_types = 
function item_structure_types(res, mysql, context, complete){
	var sql = "";
	sql += queries.select.item_structure_types;

	mysql.pool.query(sql, function(error, results, fields){
		if(error){
			res.write("callback item_structure_types returns: " + JSON.stringify(error));
			res.end();
		}
		context.item_structure_types = results;
		complete();
	});
}

callbacks.item_use_scales = 
function item_use_scales(res, mysql, context, complete){
	var sql = "";
	sql += queries.select.item_use_scales;

	mysql.pool.query(sql, function(error, results, fields){
		if(error){
			res.write("callback item_structure_types returns: " + JSON.stringify(error));
			res.end();
		}
		context.item_use_scales = results;
		complete();
	});
}

callbacks.useless_item_structures = 
function useless_item_structures(res, mysql, context, complete) {
//	console.log("calling back non container objects");
	var sql = "";
	sql += queries.select.useless_item_structures;

	mysql.pool.query(sql, function(error, results, fields){
		if(error){
			res.write("callback useless_item_structures returns: " + JSON.stringify(error));
			res.end();
		}
		context.useless_item_structures = results;
		complete();
	});
};

module.exports = callbacks;
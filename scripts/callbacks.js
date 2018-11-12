var callbacks = {};
callbacks.select = {};
callbacks.select.item_structure_list = {}; 		// id, name, type
callbacks.select.item_structure_types = {}; 	// type
callbacks.select.item_use_scales = {}; 			// scale
callbacks.select.itemUse_list_orderbyq = {};	// name, id, pilotable, capacity, scale
callbacks.select.useless_item_structures = {}; 	// id, name, type

//console.log("parsing callbacks.js");
var queries = require('./queries');

// column names: id, name, type
callbacks.select.item_structure_list = 
function item_structure_list(res, mysql, context, complete){
//	console.log("calling back item list");
	var sql = "";
	sql += queries.select.item_structure_list;
	
	//no inserts
	mysql.pool.query(sql, function(error, results, fields){
		if(error){
			res.write("callback item_structure_list returns: " + JSON.stringify(error));
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
			res.write("callback item_structure_types returns: " + JSON.stringify(error));
			res.end();
		}
		context.item_structure_types = results;
		complete();
	});
}

// column names: scale
callbacks.select.item_use_scales = 
function item_use_scales(res, mysql, context, complete){
	var sql = "";
	sql += queries.select.item_use_scales;

	mysql.pool.query(sql, function(error, results, fields){
		if(error){
			res.write("callback item_use_scales returns: " + JSON.stringify(error));
			res.end();
		}
		context.item_use_scales = results;
		complete();
	});
}

// column names: name, id, pilotable, capacity, scale
callbacks.select.itemUse_list_orderbyqq = 
function itemUse_list_orderbyqq(res, mysql, context, complete){
	var sql = "";
	sql += queries.select.itemUse_list_orderbyqq;
	var inserts = ['name'];
	
	sql = mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error){
			res.write("callback itemUse_list_orderbyqq returns: " + JSON.stringify(error));
			res.end();
		}
		context.itemUse_list_orderbyqq = results;
		complete();
	});
}

// column names: id, name, type
callbacks.select.useless_item_structures = 
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
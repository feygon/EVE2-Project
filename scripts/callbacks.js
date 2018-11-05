var callbacks = {};

//console.log("parsing callbacks.js");
var queries = require('./queries');

// select queries to get a list of ids and names from items.
callbacks.item_list = 
function item_list(res, mysql, context, complete){
//	console.log("calling back item list");
	var sql = "";
	sql += queries.select.item_list;
	

//	console.log("mysql2: " + mysql);
	//no inserts
	mysql.pool.query(sql, function(error, results, fields){
		if(error){
			res.write("cb_item_list returns: " + JSON.stringify(error));
			res.end();
		}
		context.item_list = results;
//		console.log("Results:\n" + JSON.stringify(results) + "\nResults end.");
//		console.log("Done printing results.");
		complete();
	});
};

callbacks.item_types = 
function item_types(res, mysql, context, complete){
	var sql = "";
	sql += queries.select.item_types;

	mysql.pool.query(sql, function(error, results, fields){
		if(error){
			res.write("cb_non_OCT_items returns: " + JSON.stringify(error));
			res.end();
		}
		context.item_types = results;
		complete();
	});
}

callbacks.non_OCT_items = 
function non_OCT_items(res, mysql, context, complete) {
//	console.log("calling back non container items");
	var sql = "";
	sql += queries.select.non_container_items;

	mysql.pool.query(sql, function(error, results, fields){
		if(error){
			res.write("cb_non_OCT_items returns: " + JSON.stringify(error));
			res.end();
		}
		context.non_OCT_items = results;
		complete();
	});
};

module.exports = callbacks;
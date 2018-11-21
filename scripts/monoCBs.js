var monoCBs = {};

monoCBs.create_view_CS_aggregate = 
function create_view_CS_aggregate(res, mysql, CSid, caller, complete) {
    var cbName = "monoCBs.create_view_CS_aggregate";
    var sql = monoQueries.create_view_CS_aggregate;
    var inserts = [CSid]; // could be station or ship.

    mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error){
            res.write(caller + "'s callback " + cbName
                + " returns: " + JSON.stringify(error));
			res.end();
		}
		complete(cbName);
	});
};

monoCBs.create_view_obj_aggregate = 
function create_view_obj_aggregate(res, mysql, caller, complete) {
    var cbName = "monoCBs.create_view_obj_aggregate";
    var sql = monoQueries.create_view_obj_aggregate;
    
    mysql.pool.query(sql, function(error, results, fields) {
		if(error) {
            res.write(caller + "'s callback " + cbName
                + " returns: " + JSON.stringify(error));
            res.end();
        }
        complete(cbName);
    });
};

monoCBs.insert_deep_CSs = 
function insert_deep_CSs(res, mysql, caller, complete) {
    var cbName = "monoCBs.insert_deep_CSs";
    var sql = monoQueries.insert_deep_CSs;

    mysql.pool.query(sql, function(error, results, fields) {
		if(error) {
            res.write(caller + "'s callback " + cbName
                + " returns: " + JSON.stringify(error));
            res.end();
        }
        complete(cbName);
    });
};

monoCBs.insert_deep_objs = 
function insert_deep_objs(res, mysql, caller, complete) {
    var cbName = "monoCBs.insert_deep_objs";
    var sql = monoQueries.insert_deep_objs;

    mysql.pool.query(sql, function(error, results, fields) {
		if(error) {
            res.write(caller + "'s callback " + cbName
                + " returns: " + JSON.stringify(error));
            res.end();
        }
        complete(cbName);
    });
};

// context passed through this callback does not have this name, but does
//  have the neames of the monoqueries called in sql1 and sql2.
monoCBs.onboardEntities = 
function disgorge(res, mysql, context, caller, complete){
    var cbName = "monoCBs.onboardEntities";
    var sql1 = monoQueries.onboardCargoSpaces;
    var sql2 = monoQueries.onboardObjects;

    mysql.pool.query(sql1, function(error, results, fields) {
		if(error) {
            res.write(caller + "'s callback " + cbName
                + " query sql1 = monoQueries.onboardCargoSpaces returns: " 
                + JSON.stringify(error));
            res.end();
        }
        context.onboardCargoSpaces = results;
    });
    mysql.pool.query(sql2, function(error, results, fields) {
		if(error) {
            res.write(caller + "'s callback " + cbName
                + " query sql2 = monoQueries.onboardObjects returns: " 
                + JSON.stringify(error));
            res.end();
        }
        context.onboardObjects = results;
    });
    complete(cbName);
};


monoCBs.insert_entities_deep = 
function insert_entities_deep(scale, res, mysql, caller, complete) {
    var cbName = "monoCBs.insert_entities_deep";
    var sql = "";
    if (scale == "Station") {   sql = "CALL SP_insert_station_deep()"; }
    if (scale == "Ship") {      sql = "CALL SP_insert_ship_deep()"; }
    mysql.pool.query(sql, function(error, results, fields) {
		if(error) {
            res.write(caller + "'s callback " + cbName
                + " at " + scale + " scale returns: " + JSON.stringify(error));
            res.end();
        }
        complete(cbName);
    });
}

// scale is a string, either "Station" or "Ship". Caps sensitive.
monoCBs.monolithicCallbacksInOrder =
function callbacksInOrder(res, req, mysql, context, scale, complete) {
    var readyCounter = 0;
    var cbName = "monoCBs.monolithicCallbacksInOrder";
    var total = 4;
    monoCBs.create_view_CS_aggregate(res, mysql, req.session.shipNest, cbName, ready);

    function ready(caller){
        readyCounter++;
        console.log(caller + " reports ready: " + readyCounter + " / " + total);
        if (readyCounter >= 1) {
            monoCBs.create_view_obj_aggregate(res, mysql, cbName, ready);
        }
        if (readyCounter >= 2) {
            monoCBs.insert_entities_deep(scale, res, mysql, cbName, ready);
        }
        if (readyCounter >= 3) {
            monoCBs.onboardEntities(res, mysql, context, cbName, ready);
        }
        if (readyCounter >= 4) {
            complete(cbName);
        }
    }
}


module.exports = monoCBs;

/*// column names: id, name, type
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
};*/
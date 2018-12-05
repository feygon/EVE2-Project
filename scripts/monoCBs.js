var monoCBs = {};
var monoQueries = require('./monoQueries');

monoCBs.create_view_CS_aggregate = 
function create_view_CS_aggregate(res, mysql, CSid, caller, complete) {
    var cbName = "monoCBs.create_view_CS_aggregate";
    var sql = monoQueries.create_table_CS_aggregate;
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
    var sql = monoQueries.create_table_obj_aggregate;
    
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
function disgorge(res, mysql, context, caller, complete, filterOption){
    var cbName = "monoCBs.onboardEntities";
    var sql1 = "";
    var sql2 = "";
    var filterByType = false;
    var filterByScale = false;
    var inserts = [""];
    var inserts = [""];
    if (filterOption && 
       (filterOption == "Charge" ||
        filterOption == "Container" ||
        filterOption == "Material" ||
        filterOption == "Module" ||
        filterOption == "Satellite")) {
            filterByType = true;
        }
    if (filterOption &&
       (filterOption == "Bay" ||
        filterOption == "Box" ||
        filterOption == "Ship")) {
            filterByScale = true;
        }

    if (!filterByType && !filterByScale) { 
        sql1 = monoQueries.onboardCargoSpaces;
        sql2 = monoQueries.onboardObjects;
    } else if (filterByType) {
        sql1 = monoQueries.onboardCargoSpaces
        sql2 = monoQueries.onboardObjects_ByType
        inserts = [filterOption];
    } else if (filterByScale) {
        sql1 = monoQueries.onboardCargoSpaces_ByScale
        sql2 = monoQueries.onboardObjects
        inserts = [filterOption];
    }

    var doneCount = 0;

    mysql.pool.query(sql1, inserts, function(error, results1, fields) {
		if(error) {
            res.write(caller + "'s callback " + cbName
                + " query sql1 = monoQueries.onboardCargoSpaces returns: " 
                + JSON.stringify(error));
            res.end();
        }
        console.log("results1 are: " + JSON.stringify(results1) 
            + "\n------dejavu 1-----");
        context.onboardCargoSpaces = results1;
        done();
    });
    mysql.pool.query(sql2, inserts, function(error, results2, fields) {
		if(error) {
            res.write(caller + "'s callback " + cbName
                + " query sql2 = monoQueries.onboardObjects returns: " 
                + JSON.stringify(error));
            res.end();
        }
        console.log("results2 are: " + JSON.stringify(results2) 
        + "\n------dejavu 2-----");
        context.onboardObjects = results2;
        done();
    });
    // this line marks the spot of an incredible leap of debugging intuition. Let its infamy go unsung.
    function done(){
        doneCount++;
        if (doneCount == 2) {
            complete(cbName);
        }
    }
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
};

// scale is a string, either "Station" or "Ship". Caps sensitive.
// mutate context to contain: onboardObjects and onboardCargoSpaces
monoCBs.getCargo_Deep =
function getCargo_Deep(res, req, mysql, context, scale, complete, filterOption) {
    console.log("getCargo Called.\n--------call--------");
    var readyCounter = 0;
    var cbName = "monoCBs.getCargo_Deep";
    var total = 4;
    if (scale == "Station") {
        monoCBs.create_view_CS_aggregate(res, mysql, req.session.shipNest, cbName, ready);
    }
    if (scale == "Ship") {
        monoCBs.create_view_CS_aggregate(res, mysql, req.session.shipID, cbName, ready);
    }

    function ready(caller){
        readyCounter++;
        console.log(caller + " reports ready: " + readyCounter + " / " + total);
        if (readyCounter == 1) {
            console.log("create_view_CS_aggregate complete. running create_view_obj_aggregate")
            monoCBs.create_view_obj_aggregate(res, mysql, cbName, ready);
        }
        if (readyCounter == 2) {
            console.log("create_view_obj_aggregate complete. Running insert_entities_deep")
            monoCBs.insert_entities_deep(scale, res, mysql, cbName, ready);
        }
        if (readyCounter == 3 && !filterOption) {
            console.log("insert_entities_deep complete. Running onboardEntities")
            monoCBs.onboardEntities(res, mysql, context, cbName, ready);
        } else if (readyCounter == 3) {
            monoCBs.onboardEntities(res, mysql, context, cbName, ready, filterOption);
        }
        if (readyCounter == 4) {
            console.log("getCargo_Deep complete.\n---------note---------")
            complete.complete(cbName);
        }
    };
};


module.exports = monoCBs;
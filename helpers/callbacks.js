module.exports = function() {

	var queries = req.app.get('queries');

	function cb_indy_getItems(res, mysql, context, complete){
		var sql = "";
		sql += queries.select.item_list;
		//no inserts
		mysql.pool.query(sql, function(error, results, fields){
			if(error){
				res.write("cb_indy_getItems returns: " + JSON.stringify(error));
				res.end();
			}
			context.indy_items = results;
			complete();
		})
	}

	return callbacks;

}();
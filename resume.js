module.exports = (function() {
    
    var express = require('express');
    var router = express.Router();

	router.get('/',function(req, res){
		res.sendFile(__dirname + '/Game Project Resume.htm');
	});

	router.get('/AutisticWorkPreferences/', function(req,res){
		res.sendFile(__dirname + '/AutisticWorkPreferences.htm');
	});

	router.get('/DeceiversBlade/', function(req,res){
		res.sendFile(__dirname + '/Sword of the Deceiver X.html');
	});

    return router;
})();
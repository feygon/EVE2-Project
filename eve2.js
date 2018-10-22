module.exports = function() {

    var express = require('express');
    var router = express.Router();

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        res.render('main', context);
        });

    router.get('/player', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        res.render('player', context);
        });

    router.get('/space_station/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        res.render('space station', context);
        });

    router.get('/out_in_space/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        res.render('out in space', context);
        });

    return router;
}();
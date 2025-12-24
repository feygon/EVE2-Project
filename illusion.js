var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
    var callbackCount = 0;
    var context = {};
    var mysql = req.app.get('mysqlIllusion');
    var callbacks = req.app.get('illusionCallbacks');

    // This refers to the callback we will write in the next step
    callbacks.getIllusionPage(res, mysql, context, complete);

    function complete(){
        callbackCount++;
        if(callbackCount >= 1){
            // res.json(context);
            res.render('illusions', {
                layout: null,
                categories: context.categories
            });
        }
    }
});

module.exports = router;
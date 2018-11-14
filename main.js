var express=require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var queries = require('./scripts/queries.js'); // big object full of sql strings

app.use(session({
    secret:'SuperSecretPasswordReallyItsLikeTheBestPa55word',
    resave: true,
    saveUninitialized: false,
    cookie: {
        // 7 day cookie
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
if (process.argv[2]===undefined){process.argv[2]="3001";}
app.set('port', process.argv[2]);
app.set('mysql', mysql);
app.set('hbs', handlebars);

var callbacks = require('./scripts/callbacks.js');  // callback functions

app.set('queries', queries); // needed?

app.use('/eve2', require('./eve2.js'));

app.use(function(req,res){
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});
  
app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
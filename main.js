/**
 * @file This file contains the main server code for the RealFeygon.com single-page application.
 * @summary This file sets up the server, imports required modules, and defines routes.
 * @description The server uses Express.js framework, 
 *  MySQL for database connection, and Handlebars as the view engine.
 * @date 2022-10-01
 * @author Feygon Nickerson
 */
// Load environment variables
require('dotenv').config();

// Importing required modules
var express=require('express');  // Express.js framework
var session = require('express-session');  // Session management
var bodyParser = require('body-parser');  // Middleware to handle request body
var helpers = require('./views/helpers/helpers');  // Helper functions for views
var mysql = require('./dbcon.js');  // MySQL connection information
var mysqlIllusion = require('./dbcon_illusion.js');  // MySQL connection for illusion spells
var callbacks = require('./scripts/callbacks.js');  // callback functions
var illusionCallbacks = require('./scripts/illusionCallbacks.js'); // Illusion-specific callbacks
var queries = require('./scripts/queries.js'); // Importing SQL queries
var path = require('path'); // Path module for serving static files

// Setting up handlebars view engine
var handlebars = require('express-handlebars').create({
    defaultLayout:'main',
    helpers: helpers,   // Assigning helpers
    partialsDir: './views/partials',  // Assigning partials
    cache: false  // Disable caching for development
});

// Creating an Express application
var app = express();

// Using express-session for session management
app.use(session({
    secret: process.env.SESSION_SECRET || '5up3r53cr3tPa55wordR3allyIt5Lik3Th3B35tPa55word3v3r',
    resave: true,
    saveUninitialized: false,
    cookie: {
        // 7 day cookie
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

// Setting up the view engine
app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));  // Serving static files
app.set('view engine', 'handlebars');

// Setting the port for the server
if (process.argv[2]===undefined) { process.argv[2]="80"; }
app.set('port', process.argv[2]);

// Setting up MySQL and handlebars
app.set('mysql', mysql);
app.set('mysqlIllusion', mysqlIllusion);
app.set('hbs', handlebars);

// Importing and setting up callbacks
app.set('callbacks', callbacks);
app.set('illusionCallbacks', illusionCallbacks);
app.set('queries', queries);

// Set a route for each module
app.use('/resume/', require('./resume.js'));
app.use('/eve2/', require('./eve2.js'));
app.use('/illusion/', require('./illusion.js'));

// Documentation route - serve the HTML portal
app.get('/documentation', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Site index route - serve the site map
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'site-index.html'));
});

// Root redirects to resume (default)
app.get('/',(req,res)=> { 
	res.redirect(301, "https://www.realfeygon.com/resume") 
});

// Serve documentation folder as static (for markdown files)
// This must come AFTER the /documentation route to avoid conflicts
app.use('/docs', express.static('docs'));

// Route to serve README.md file
app.get('/README.md', (req, res) => {
    res.sendFile(path.join(__dirname, 'README.md'));
});

app.use(function(req, res){
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

// End of main.js

// Application structure:

/*
main.js
|App
|-- express (Web application framework)
|   |
|   |-- bodyParser (Middleware for handling request body)
|   |-- session (Session management)
|   |-- handlebars (View engine setup)
|       |
|       |-- helpers (Helper functions for views)
|       |-- partials (Partials for views)
|
|-- Properties
|   |
|   |-- mysql (MySQL connection setup)
|   |-- callbacks (Callback functions)
|   |-- queries (SQL queries)
|
|-- Routes
|   |
|   |-- resume.js (Resume module)
|   |-- eve2.js (Eve2 module)
|   |-- Errors (404, 500)
*/
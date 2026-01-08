// Load environment variables (not needed on DirectAdmin - uses system env vars)
// require('dotenv').config();

var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST || 'localhost',
  port            : process.env.DB_PORT || 3306,
  user            : 'realfey_realfey_realfeyuser',  // Hardcoded temporarily to bypass env var issues
  password        : process.env.DB_PASSWORD,
  database        : process.env.DB_NAME || 'realfey_realfey_eve2_project',
  multipleStatements: true
});

module.exports.pool = pool;

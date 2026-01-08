// Load environment variables for local development
// In production, DirectAdmin Node.js Selector manages environment variables
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST || 'localhost',
  port            : process.env.DB_PORT || 3306,
  user            : process.env.DB_USER || 'realfey_realfey_realfeyuser',
  password        : process.env.DB_PASSWORD,
  database        : process.env.DB_NAME || 'realfey_realfey_eve2_project',
  multipleStatements: true
});

module.exports.pool = pool;

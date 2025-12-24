// Load environment variables
require('dotenv').config();

var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_ILLUSION_HOST || 'localhost',
  port            : process.env.DB_ILLUSION_PORT || 3306,
  user            : process.env.DB_ILLUSION_USER || 'realfey_illusion_spells_DB',
  password        : process.env.DB_ILLUSION_PASSWORD,
  database        : process.env.DB_ILLUSION_NAME || 'realfey_illusion_spells_DB',
  multipleStatements: true
});

module.exports.pool = pool;
/**
 * Database connection for the public BurnRate demo route.
 * Uses a separate local SQLite file so the demo route does not depend on a
 * private planner database path or runtime secret.
 */
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.BURNRATE_DB_PATH || path.join(__dirname, 'burnrate_data', 'burnrate_demo.db');

const db = new Database(dbPath, {
    verbose: process.env.NODE_ENV !== 'production' ? console.log : null,
    fileMustExist: true
});

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

module.exports = db;

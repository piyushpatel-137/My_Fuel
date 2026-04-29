const mysql = require("mysql2/promise");

const useSSL = true;

const pool = mysql.createPool({
  uri: process.env.DB_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: useSSL ? { minVersion: "TLSv1.2" } : undefined
});

module.exports = pool;
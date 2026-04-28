const mysql = require("mysql2/promise");
require("./env");

const useSsl = ["true", "1", "yes"].includes(String(
  process.env.DB_SSL || process.env.TIDB_ENABLE_SSL || ""
).toLowerCase());

const poolConfig = {
  host: process.env.TIDB_HOST || process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  port: Number(process.env.TIDB_PORT || process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  user: process.env.TIDB_USER || process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.TIDB_PASSWORD ?? process.env.MYSQLPASSWORD ?? process.env.DB_PASSWORD ?? "",
  database: process.env.TIDB_DATABASE || process.env.MYSQLDATABASE || process.env.DB_NAME || "myfuel",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};

if (useSsl) {
  poolConfig.ssl = { minVersion: "TLSv1.2" };
}

const pool = mysql.createPool(poolConfig);

module.exports = pool;
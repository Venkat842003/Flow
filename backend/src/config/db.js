const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log(process.env.DATABASE_URL?.substring(0, 20));

module.exports = pool;

pool
  .query("SELECT NOW()")
  .then(() => console.log("Connected to Neon"))
  .catch((err) => console.error("Neon connection failed:", err));

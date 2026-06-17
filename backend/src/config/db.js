const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;

pool
  .query("SELECT NOW()")
  .then(() => console.log("Connected to Neon"))
  .catch((err) => console.error("Neon connection failed:", err));

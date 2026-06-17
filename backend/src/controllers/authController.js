const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function login(req, res) {
  try {
    const { email, password } = req.body;

  

    const result = await pool.query(
      `
            SELECT * FROM users WHERE email = $1
            `,
      [email],
    );

    const user = result.rows[0];
  

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      token,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      message: "Login failed",
    });
  }
}
async function createUser(req, res) {
  try {
    const { email, password, role } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
            INSERT INTO users (email, password_hash, role)
            VALUES ($1, $2, $3)

            RETURNING id, email, role`,
      [email, passwordHash, role],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create user" });
  }
}

async function getUsers(req, res) {
  try {
    const result = await pool.query(`SELECT id, email, role FROM users`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

module.exports = { createUser, login, getUsers };

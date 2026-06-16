const pool = require("../config/db");

const getIssues = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM issues");
    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({ message: "Failed to fetch issues" });
  }
};

async function createIssue(req, res) {
  try {
    const description = req.body.description;

    const result = await pool.query(
      `INSERT INTO issues (description) VALUES ($1) RETURNING *`,
      [description],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create issue" });
  }
}

async function deleteIssue(req, res) {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM issues WHERE id=$1`, [id]);

    res.json({ message: "Issue deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete issue" });
  }
}

module.exports = { getIssues, createIssue, deleteIssue };

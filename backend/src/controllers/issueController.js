const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");

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
    const { issueId } = req.params;
    const result = await pool.query(
      `SELECT cloudinary_public_id
   FROM steps
   WHERE issue_id = $1`,
      [issueId],
    );

    for (const step of result.rows) {
      if (step.cloudinary_public_id) {
        await cloudinary.uploader.destroy(step.cloudinary_public_id);
      }
    }

    await pool.query(`DELETE FROM issues WHERE id=$1`, [issueId]);

    res.json({ message: "Issue deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete issue" });
  }
}

module.exports = { getIssues, createIssue, deleteIssue };

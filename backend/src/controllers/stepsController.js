const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");

async function getStepsByIssueId(req, res) {
  try {
    const { issueId } = req.params;

    const result = await pool.query(
      `SELECT * FROM steps WHERE issue_id = $1 ORDER BY step_order`,
      [issueId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch steps" });
  }
}

async function saveSteps(req, res) {
  await pool.query("BEGIN");
  try {
    const { steps } = req.body;

    for (const step of steps) {
      console.log(typeof step.options[0]);
      console.log(step.options[0]);
      await pool.query(
        ` INSERT INTO steps (id, issue_id, instruction, image_url, is_question, next_step_id, 
        next_step_yes, next_step_no, next_issue_id, is_start, created_at, step_order, is_end, cloudinary_public_id, options) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        
        ON CONFLICT (id) 
        DO UPDATE SET
        issue_id = EXCLUDED.issue_id,
        instruction = EXCLUDED.instruction,
        image_url = EXCLUDED.image_url,
        is_question = EXCLUDED.is_question,
        next_step_id = EXCLUDED.next_step_id,
        next_step_yes = EXCLUDED.next_step_yes,
        next_step_no = EXCLUDED.next_step_no,
        next_issue_id = EXCLUDED.next_issue_id,
        is_start = EXCLUDED.is_start,
        created_at = EXCLUDED.created_at,
        step_order = EXCLUDED.step_order,
        is_end = EXCLUDED.is_end,
        cloudinary_public_id = EXCLUDED.cloudinary_public_id,
        options = EXCLUDED.options
        `,

        [
          step.id,
          step.issue_id,
          step.instruction,
          step.image_url,
          step.is_question,
          step.next_step_id,
          step.next_step_yes,
          step.next_step_no,
          step.next_issue_id,
          step.is_start,
          step.created_at,
          step.step_order,
          step.is_end,
          step.cloudinary_public_id,
          step.options,
        ],
      );
    }
    await pool.query("COMMIT");
    res.json({ message: "Steps saved successfully" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Failed to save steps" });
  }
}

async function deleteStep(req, res) {
  try {
    const { stepId } = req.params;

    const { publicId } = req.body;

    const result = await pool.query(
      "SELECT cloudinary_public_id FROM steps WHERE id = $1",
      [stepId],
    );

    const dbPublicId = result.rows[0]?.cloudinary_public_id;

    const publicIdToDelete = publicId || dbPublicId;

    if (publicIdToDelete) {
      await cloudinary.uploader.destroy(publicIdToDelete);
    }
    await pool.query(`DELETE FROM steps WHERE id = $1`, [stepId]);

    res.json({ message: "Step deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete step" });
  }
}

module.exports = { getStepsByIssueId, saveSteps, deleteStep };

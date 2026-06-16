const express = require("express");

const {
  getStepsByIssueId,
  saveSteps,
  deleteStep,
} = require("../controllers/stepsController");

const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");

router.get("/:issueId",  getStepsByIssueId);
router.post("/save", authenticateUser, saveSteps);
router.delete("/:stepId", authenticateUser, deleteStep);

module.exports = router;


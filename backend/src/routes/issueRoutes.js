const { getIssues, createIssue, deleteIssue } = require("../controllers/issueController");
const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");

router.get("/",  getIssues);
router.post("/", authenticateUser, createIssue);
router.delete("/:issueId", authenticateUser, deleteIssue);

module.exports = router;

const express = require("express");

const {createUser, login, getUsers} =  require("../controllers/authController")
const authenticateUser = require("../middleware/authMiddleware")

const router = express.Router();

router.post("/", createUser)
router.post("/login", login)
router.get("/users", getUsers), 

router.get("/me", authenticateUser, (req, res) => {
  res.json(req.user);
});

module.exports = router
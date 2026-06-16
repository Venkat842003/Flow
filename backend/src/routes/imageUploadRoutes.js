const express = require("express");

const { uploadImage } = require("../controllers/imageUploadController");

const upload = require("../middleware/upload");

const authenticateUser = require("../middleware/authMiddleware")


const router = express.Router();

router.post("/",authenticateUser,  upload.single("image"), uploadImage);

module.exports = router;

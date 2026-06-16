const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const issueRoutes = require("./routes/issueRoutes");
const stepRoutes = require("./routes/stepRoutes");
const imageUploadsRoutes = require("./routes/imageUploadRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/issues", issueRoutes);
app.use("/api/steps", stepRoutes);
app.use("/api/upload", imageUploadsRoutes);
app.use("/api/auth", authRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
  
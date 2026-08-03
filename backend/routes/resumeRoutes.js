const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const { extractText } = require("../controllers/resumeController");

const router = express.Router();

router.post(
  "/resume/extract",
  authMiddleware,
  upload.single("resume"),
  extractText
);

module.exports = router;
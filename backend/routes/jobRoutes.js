const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getRecommendations } = require("../controllers/jobController");

const router = express.Router();

router.get("/jobs/recommendations", authMiddleware, getRecommendations);

module.exports = router;
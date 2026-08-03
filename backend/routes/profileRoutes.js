const express = require("express");
const protect = require("../middleware/authMiddleware");
const supabase = require("../utils/supabaseClient");

const router = express.Router();

router.get("/profile", protect, async (req, res) => {
  try {
    if (!supabase) {
      return res
        .status(500)
        .json({ message: "Supabase not configured. Check backend/.env" });
    }

    // Fetch full profile from Supabase
    const { data: profile, error } = await supabase
      .from("users")
      .select("id, name, email, created_at")
      .eq("id", req.user.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: "Failed to fetch profile" });
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({
      message: "Profile accessed successfully",
      user: profile,
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

module.exports = router;
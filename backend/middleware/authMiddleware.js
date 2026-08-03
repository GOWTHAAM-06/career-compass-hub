const jwt = require("jsonwebtoken");
const supabase = require("../utils/supabaseClient");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    if (supabase) {
      // Validate against Supabase by fetching the user
      const { data: userData, error } = await supabase.auth.getUser(token);

      if (error || !userData.user) {
        throw new Error("Invalid Supabase token");
      }

      decoded = {
        id: userData.user.id,
        email: userData.user.email,
      };
    } else {
      // Fallback: local JWT verification (for dev without Supabase)
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
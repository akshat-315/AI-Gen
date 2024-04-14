const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAuthenticated = asyncHandler(async (req, res, next) => {
  try {
    if (!req.cookies.token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = isAuthenticated;

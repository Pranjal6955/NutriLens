const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({ message: "Authentication misconfigured" });
    }

    // Read token from httpOnly cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach only trusted data to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      userName: decoded.userName
    };

    next();
  } catch (err) {
    console.warn("Auth middleware error:", err.message);

    return res.status(401).json({
      message: "Invalid or expired authentication token"
    });
  }
};

module.exports = authMiddleware;

const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;



    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload (e.g., userId, role) to request object
     req.user = {
      _id: decoded.userId,
      role: decoded.role,
    };

    
    next();
  } catch (error) {
    console.error("JWT auth error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = auth;

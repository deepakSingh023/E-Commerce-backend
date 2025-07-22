// middlewares/optionalAuth.js
const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id; // or whatever you store in JWT
    } catch (err) {
      req.userId = null; // invalid token, just ignore
    }
  } else {
    req.userId = null; // no token, anonymous user
  }

  next();
};

module.exports = optionalAuth;

const jwt = require("jsonwebtoken");

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    const token = header.split(" ")[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    } catch {
      // Invalid/expired token on a public route — just proceed as a guest.
    }
  }
  next();
}

module.exports = optionalAuth;
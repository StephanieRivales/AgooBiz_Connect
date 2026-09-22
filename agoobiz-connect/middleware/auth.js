const jwt = require("jsonwebtoken");
const { fail } = require("../lib/responses");

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return fail(res, 401, "Please log in first.");
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    req.user = payload; // { id, email, role }
    next();
  } catch {
    return fail(res, 401, "Session expired. Please log in again.");
  }
}

module.exports = authenticate;
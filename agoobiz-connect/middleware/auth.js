const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { fail } = require("../lib/responses");

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return fail(res, 401, "Please log in first.");
  }

  const token = header.split(" ")[1];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
  } catch {
    return fail(res, 401, "Session expired. Please log in again.");
  }

  try {
    // Check the account on every request so a deactivation takes effect right away,
    // even for someone who is already logged in.
    const account = await User.findByPk(payload.id, { attributes: ["id", "isActive", "isBlocked"] });
    if (!account) {
      return fail(res, 401, "Session expired. Please log in again.");
    }
    if (account.isBlocked) {
      return fail(res, 403, "Your account has been blocked. Please contact the AgooBiz admin.");
    }
    if (!account.isActive) {
      return fail(res, 403, "Your account has been deactivated. Please contact the AgooBiz admin.");
    }
  } catch (err) {
    return fail(res, 500, "We couldn't verify your account right now.", err);
  }

  req.user = payload; // { id, email, role }
  next();
}

module.exports = authenticate;
const { fail } = require("../lib/responses");

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return fail(res, 403, "You don't have permission for this action.");
    }
    next();
  };
}

module.exports = requireRole;
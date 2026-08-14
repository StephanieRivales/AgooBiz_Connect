// Account/profile management, plus admin-only user oversight.
const express = require("express");
const router = express.Router();
const { User } = require("../models");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { ok, fail } = require("../lib/responses");

// "Who am I?" — used by the frontend to load the logged-in user's own profile.
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ["password"] } });
    if (!user) return fail(res, 404, "We couldn't find your account.");
    return ok(res, user);
  } catch (err) {
    return fail(res, 500, "We couldn't load your profile right now.", err);
  }
});

// Let a user update their own profile — but never let this endpoint
// change their password or role, that needs a dedicated, more careful flow.
router.put("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return fail(res, 404, "We couldn't find your account.");

    const { password, role, ...safeUpdates } = req.body;
    await user.update(safeUpdates);

    return ok(res, user);
  } catch (err) {
    return fail(res, 500, "We couldn't save your profile changes.", err);
  }
});

// Admin-only: see everyone on the platform.
router.get("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    return ok(res, users);
  } catch (err) {
    return fail(res, 500, "We couldn't load the user list.", err);
  }
});

// Admin-only: change someone's role or account status.
router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return fail(res, 404, "That user doesn't exist.");

    await user.update(req.body);
    return ok(res, user);
  } catch (err) {
    return fail(res, 500, "We couldn't update that user.", err);
  }
});

// Admin-only: remove a user's account entirely.
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return fail(res, 404, "That user doesn't exist.");

    await user.destroy();
    return ok(res, { message: "User account deleted." });
  } catch (err) {
    return fail(res, 500, "We couldn't delete that user.", err);
  }
});

module.exports = router;
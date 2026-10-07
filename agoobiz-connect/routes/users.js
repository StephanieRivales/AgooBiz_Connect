// Account/profile management, plus admin-only user oversight.
const express = require("express");
const router = express.Router();
const { User, Follow } = require("../models");
const { Op } = require("sequelize");
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

    const updates = {};
    ["name", "contactNumber", "barangay", "address"].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });
    if (Object.prototype.hasOwnProperty.call(req.body, "orderCutoffStart") ||
        Object.prototype.hasOwnProperty.call(req.body, "orderCutoffEnd")) {
      if (user.role !== "seller") {
        return fail(res, 403, "Only sellers can update their order hours.");
      }

      const { orderCutoffStart, orderCutoffEnd } = req.body;
      const validTime = (value) => typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
      if (!validTime(orderCutoffStart) || !validTime(orderCutoffEnd) ||
          orderCutoffStart >= orderCutoffEnd) {
        return fail(res, 400, "Enter valid order hours with the closing time after the opening time.");
      }

      updates.orderCutoffStart = orderCutoffStart;
      updates.orderCutoffEnd = orderCutoffEnd;
    }

    await user.update(updates);
    const safeUser = user.toJSON();
    delete safeUser.password;
    return ok(res, safeUser);
  } catch (err) {
    return fail(res, 500, "We couldn't save your profile changes.", err);
  }
});

router.get("/discover", authenticate, async (req, res) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const where = {
      id: { [Op.ne]: req.user.id },
      isActive: true,
      isBlocked: false,
      ...(search ? { name: { [Op.iLike]: `%${search}%` } } : {}),
    };
    const users = await User.findAll({
      where,
      attributes: ["id", "name", "role", "barangay", "verificationStatus"],
      order: [["name", "ASC"]],
      limit: 50,
    });
    const follows = await Follow.findAll({
      where: { followerId: req.user.id, followingId: users.map((person) => person.id) },
      attributes: ["followingId"],
    });
    const followingIds = new Set(follows.map((follow) => Number(follow.followingId)));
    return ok(res, users.map((person) => ({
      ...person.toJSON(),
      isFollowing: followingIds.has(Number(person.id)),
    })));
  } catch (err) {
    return fail(res, 500, "We couldn't find people right now.", err);
  }
});

router.get("/following", authenticate, async (req, res) => {
  try {
    const follows = await Follow.findAll({
      where: { followerId: req.user.id },
      include: [{
        model: User,
        as: "followedUser",
        attributes: ["id", "name", "role", "barangay", "verificationStatus"],
        where: { isActive: true, isBlocked: false },
      }],
      order: [["createdAt", "DESC"]],
    });
    return ok(res, follows.map((follow) => follow.followedUser));
  } catch (err) {
    return fail(res, 500, "We couldn't load the accounts you follow.", err);
  }
});

router.post("/:id/follow", authenticate, async (req, res) => {
  try {
    const followingId = Number(req.params.id);
    if (!Number.isInteger(followingId) || followingId < 1 || followingId === Number(req.user.id)) {
      return fail(res, 400, "Choose another account to follow.");
    }
    const person = await User.findOne({ where: { id: followingId, isActive: true, isBlocked: false } });
    if (!person) return fail(res, 404, "That account could not be found.");
    await Follow.findOrCreate({ where: { followerId: req.user.id, followingId } });
    return ok(res, { following: true });
  } catch (err) {
    return fail(res, 500, "We couldn't follow that account.", err);
  }
});

router.delete("/:id/follow", authenticate, async (req, res) => {
  try {
    const followingId = Number(req.params.id);
    if (!Number.isInteger(followingId) || followingId < 1 || followingId === Number(req.user.id)) {
      return fail(res, 400, "Choose a valid account to unfollow.");
    }
    await Follow.destroy({ where: { followerId: req.user.id, followingId } });
    return ok(res, { following: false });
  } catch (err) {
    return fail(res, 500, "We couldn't unfollow that account.", err);
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

    const updates = {};
    if (Object.prototype.hasOwnProperty.call(req.body, "isActive")) {
      if (typeof req.body.isActive !== "boolean") {
        return fail(res, 400, "Account activation must be enabled or disabled.");
      }
      if (req.body.isActive === false && user.id === req.user.id) {
        return fail(res, 400, "You can't deactivate your own account.");
      }
      updates.isActive = req.body.isActive;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "isBlocked")) {
      if (typeof req.body.isBlocked !== "boolean") {
        return fail(res, 400, "Account block status must be enabled or disabled.");
      }
      if (req.body.isBlocked === false) {
        updates.isBlocked = false;
        updates.moderationReason = null;
        updates.moderatedAt = null;
      } else {
        const reason = typeof req.body.moderationReason === "string"
          ? req.body.moderationReason.trim()
          : "";
        if (reason.length < 10) {
          return fail(res, 400, "Provide a moderation reason of at least 10 characters before blocking an account.");
        }
        if (user.id === req.user.id) {
          return fail(res, 400, "You can't block your own account.");
        }
        updates.isBlocked = true;
        updates.moderationReason = reason;
        updates.moderatedAt = new Date();
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "verificationStatus")) {
      if (!["pending", "approved", "rejected"].includes(req.body.verificationStatus)) {
        return fail(res, 400, "Choose a valid seller verification status.");
      }
      updates.verificationStatus = req.body.verificationStatus;
    }

    await user.update(updates);
    const safeUser = user.toJSON();
    delete safeUser.password;
    return ok(res, safeUser);
  } catch (err) {
    return fail(res, 500, "We couldn't update that user.", err);
  }
});

// Admin-only: remove a user's account entirely.
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    if (Number(req.params.id) === Number(req.user.id)) {
      return fail(res, 400, "You can't delete your own admin account.");
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return fail(res, 404, "That user doesn't exist.");

    await user.destroy();
    return ok(res, { message: "User account deleted." });
  } catch (err) {
    return fail(res, 500, "We couldn't delete that user.", err);
  }
});

module.exports = router;
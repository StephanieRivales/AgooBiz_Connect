// Platform-wide announcements — admins post them, everyone can read them.
const express = require("express");
const router = express.Router();
const { Announcement } = require("../models");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { ok, fail } = require("../utils/response");

// Public — shown on the homepage or a notices banner.
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.findAll({ order: [["createdAt", "DESC"]] });
    return ok(res, announcements);
  } catch (err) {
    return fail(res, 500, "We couldn't load the latest announcements.", err);
  }
});

// Admin posts a new announcement.
router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return fail(res, 400, "An announcement needs both a title and a message.");
    }

    const announcement = await Announcement.create({
      title,
      message,
      createdBy: req.user.id,
    });

    return ok(res, announcement, 201);
  } catch (err) {
    return fail(res, 500, "We couldn't post your announcement.", err);
  }
});

// Admin edits an existing announcement.
router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return fail(res, 404, "That announcement no longer exists.");

    await announcement.update(req.body);
    return ok(res, announcement);
  } catch (err) {
    return fail(res, 500, "We couldn't update that announcement.", err);
  }
});

// Admin removes an announcement.
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return fail(res, 404, "That announcement no longer exists.");

    await announcement.destroy();
    return ok(res, { message: "Announcement removed." });
  } catch (err) {
    return fail(res, 500, "We couldn't delete that announcement.", err);
  }
});

module.exports = router;
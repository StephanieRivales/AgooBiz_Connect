// Direct messages between two users — e.g. a buyer asking a seller a question.
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Message, User } = require("../models");
const authenticate = require("../middleware/auth");
const { ok, fail } = require("../lib/responses");


// The full back-and-forth between the logged-in user and one other person.
router.get("/conversation/:userId", authenticate, async (req, res) => {
  try {
    const otherUserId = Number(req.params.userId);
    if (!Number.isInteger(otherUserId) || otherUserId < 1 || otherUserId === Number(req.user.id)) {
      return fail(res, 400, "Choose another account to open a conversation.");
    }
    const partner = await User.findOne({
      where: { id: otherUserId, isActive: true, isBlocked: false },
      attributes: ["id", "name", "email", "role", "verificationStatus"],
    });
    if (!partner) return fail(res, 404, "That account could not be found.");

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: req.user.id },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    await Message.update(
      { readAt: new Date() },
      { where: { senderId: otherUserId, receiverId: req.user.id, readAt: null } }
    );
    return ok(res, { partner, messages });
  } catch (err) {
    return fail(res, 500, "We couldn't load this conversation.", err);
  }
});

// A quick list of every conversation the logged-in user is part of — the inbox view.
router.get("/inbox", authenticate, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      },
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "email", "role", "verificationStatus"] },
        { model: User, as: "receiver", attributes: ["id", "name", "email", "role", "verificationStatus"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return ok(res, messages);
  } catch (err) {
    return fail(res, 500, "We couldn't load your inbox.", err);
  }
});

// Send a new message to another user.
router.post("/", authenticate, async (req, res) => {
  try {
    const receiverId = Number(req.body.receiverId);
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";

    if (!Number.isInteger(receiverId) || receiverId < 1 || receiverId === Number(req.user.id)) {
      return fail(res, 400, "Choose another account as the message recipient.");
    }
    if (!content) {
      return fail(res, 400, "A message needs a recipient and some content.");
    }
    if (content.length > 4000) return fail(res, 400, "Messages must be 4,000 characters or fewer.");
    const recipient = await User.findOne({ where: { id: receiverId, isActive: true, isBlocked: false } });
    if (!recipient) return fail(res, 404, "That account could not be found.");

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      content,
      readAt: null,
    });

    return ok(res, message, 201);
  } catch (err) {
    return fail(res, 500, "We couldn't send your message. Please try again.", err);
  }
});

module.exports = router;
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
    const otherUserId = req.params.userId;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: req.user.id },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    return ok(res, messages);
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
        { model: User, as: "sender", attributes: ["id", "name", "email"] },
        { model: User, as: "receiver", attributes: ["id", "name", "email"] },
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
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return fail(res, 400, "A message needs a recipient and some content.");
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      content,
    });

    return ok(res, message, 201);
  } catch (err) {
    return fail(res, 500, "We couldn't send your message. Please try again.", err);
  }
});

module.exports = router;
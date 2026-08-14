// Lets buyers leave feedback on products they've ordered.
const express = require("express");
const router = express.Router();
const { Review, User } = require("../models");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { ok, fail } = require("../lib/responses");

// Public — anyone browsing a product can see what buyers thought of it.
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { productId: req.params.productId },
      include: [{ model: User, as: "buyer", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });
    return ok(res, reviews);
  } catch (err) {
    return fail(res, 500, "We couldn't load the reviews for this product.", err);
  }
});

// A buyer leaves a rating + comment after receiving their order.
router.post("/", authenticate, requireRole("buyer"), async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    if (!productId || !rating) {
      return fail(res, 400, "Please include a product and a star rating.");
    }
    if (rating < 1 || rating > 5) {
      return fail(res, 400, "Ratings need to be between 1 and 5 stars.");
    }

    const review = await Review.create({
      productId,
      orderId,
      buyerId: req.user.id,
      rating,
      comment,
    });

    return ok(res, review, 201);
  } catch (err) {
    return fail(res, 500, "We couldn't post your review. Please try again.", err);
  }
});

// A buyer can take down their own review; admins can moderate any review.
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return fail(res, 404, "That review no longer exists.");

    const isOwner = review.buyerId === req.user.id;
    if (req.user.role !== "admin" && !isOwner) {
      return fail(res, 403, "You can only delete your own reviews.");
    }

    await review.destroy();
    return ok(res, { message: "Review deleted." });
  } catch (err) {
    return fail(res, 500, "We couldn't delete that review.", err);
  }
});

module.exports = router;
// Everything related to browsing and managing the food listings sellers put up.
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Product, User } = require("../models");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { ok, fail } = require("../lib/responses");


// Anyone can browse products — no login needed.
// Supports ?category=Pancit and ?search=lechon to help narrow things down.
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = {};

    if (category && category !== "All") where.category = category;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const products = await Product.findAll({
      where,
      include: [{ model: User, as: "seller", attributes: ["id", "name", "email"] }],
    });

    return ok(res, products);
  } catch (err) {
    return fail(res, 500, "We couldn't load the products right now. Please try again in a moment.", err);
  }
});

// A single product's details — used on the product page.
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: User, as: "seller", attributes: ["id", "name", "email"] }],
    });

    if (!product) {
      return fail(res, 404, "We couldn't find that product — it may have been removed.");
    }

    return ok(res, product);
  } catch (err) {
    return fail(res, 500, "Something went wrong while loading this product.", err);
  }
});

// Sellers list a new dish here. Buyers and guests can't create products.
router.post("/", authenticate, requireRole("seller"), async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;

    if (!name || !price || !category) {
      return fail(res, 400, "Please fill in the product name, price, and category before saving.");
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      sellerId: req.user.id,
    });

    return ok(res, product, 201);
  } catch (err) {
    return fail(res, 500, "We couldn't save your product. Please try again.", err);
  }
});

// Update a listing — only the seller who owns it (or an admin) can edit it.
router.put("/:id", authenticate, requireRole("seller", "admin"), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return fail(res, 404, "That product doesn't exist anymore.");
    }

    const isOwner = product.sellerId === req.user.id;
    if (req.user.role === "seller" && !isOwner) {
      return fail(res, 403, "You can only edit products from your own shop.");
    }

    await product.update(req.body);
    return ok(res, product);
  } catch (err) {
    return fail(res, 500, "We couldn't update this product. Please try again.", err);
  }
});

// Remove a listing — same ownership rule as editing.
router.delete("/:id", authenticate, requireRole("seller", "admin"), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return fail(res, 404, "That product doesn't exist anymore.");
    }

    const isOwner = product.sellerId === req.user.id;
    if (req.user.role === "seller" && !isOwner) {
      return fail(res, 403, "You can only delete products from your own shop.");
    }

    await product.destroy();
    return ok(res, { message: "Product removed successfully." });
  } catch (err) {
    return fail(res, 500, "We couldn't delete this product. Please try again.", err);
  }
});

module.exports = router;
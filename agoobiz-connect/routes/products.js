// Everything related to browsing and managing the food listings sellers put up.
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Product, User } = require("../models");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { ok, fail } = require("../lib/responses");
const { productUpload } = require("../middleware/upload");

const parseJsonArray = (value, fieldName) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") throw new Error(`${fieldName} must be a list.`);
  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error(`${fieldName} must be a list.`);
  return parsed;
};

const validOptions = (options) =>
  new Set(options.map((option) =>
    typeof option?.name === "string" ? option.name.trim().toLowerCase() : ""
  )).size === options.length &&
  options.every((option) =>
    option &&
    typeof option.name === "string" &&
    option.name.trim() &&
    Array.isArray(option.choices) &&
    option.choices.length > 0 &&
    new Set(option.choices.map((choice) =>
      typeof choice?.name === "string" ? choice.name.trim().toLowerCase() : ""
    )).size === option.choices.length &&
    option.choices.every((choice) =>
      choice &&
      typeof choice.name === "string" &&
      choice.name.trim() &&
      Number.isFinite(Number(choice.extraPrice)) &&
      Number(choice.extraPrice) >= 0
    )
  );

// Anyone can browse products — no login needed.
// Supports ?category=Pancit and ?search=lechon to help narrow things down.
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = { isAvailable: true };

    if (category && category !== "All") where.category = category;
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (req.query.sellerId) where.sellerId = req.query.sellerId;

    const products = await Product.findAll({
      where,
      include: [{ model: User, as: "seller", attributes: ["id", "name", "email"] }],
    });

    return ok(res, products);
  } catch (err) {
    return fail(res, 500, "We couldn't load the products right now. Please try again in a moment.", err);
  }
});

router.get("/mine", authenticate, requireRole("seller"), async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { sellerId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    return ok(res, products);
  } catch (err) {
    return fail(res, 500, "We couldn't load your listings right now.", err);
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
router.post("/", authenticate, requireRole("seller"), productUpload.single("image"), async (req, res) => {
  try {
    const seller = await User.findByPk(req.user.id);
    if (!seller || seller.verificationStatus !== "approved") {
      return fail(res, 403, "Your seller account is still pending verification. You can list products once it's approved.");
    }

    const { name, description, price, category, stock } = req.body;

    if (!name || !price) {
      return fail(res, 400, "Please fill in the product name and price before saving.");
    }

    let occasions;
    let options;
    try {
      occasions = parseJsonArray(req.body.occasions || "[]", "Celebrations");
      options = parseJsonArray(req.body.options || "[]", "Product options");
    } catch (err) {
      return fail(res, 400, err.message);
    }
    if (!occasions.length || occasions.some((occasion) => typeof occasion !== "string" || !occasion.trim())) {
      return fail(res, 400, "Choose at least one celebration for this product.");
    }
    if (!validOptions(options)) {
      return fail(res, 400, "Each product option needs a name and at least one choice with a valid extra price.");
    }

    const product = await Product.create({
      name,
      description,
      price,
      category: occasions[0],
      occasions,
      options,
      image: req.file ? `/uploads/products/${req.file.filename}` : null,
      stock: stock ?? 0,
      sellerId: req.user.id,
    });

    return ok(res, product, 201);
  } catch (err) {
    return fail(res, 500, "SAVE ERROR: " + err.message, err);
  }
});

// Update a listing — only the seller who owns it (or an admin) can edit it.
router.put("/:id", authenticate, requireRole("seller", "admin"), productUpload.single("image"), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return fail(res, 404, "That product doesn't exist anymore.");
    }

    const isOwner = product.sellerId === req.user.id;
    if (req.user.role === "seller" && !isOwner) {
      return fail(res, 403, "You can only edit products from your own shop.");
    }

    const updates = {};
    ["name", "description", "price", "category", "stock"].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) updates[field] = req.body[field];
    });
    if (Object.prototype.hasOwnProperty.call(req.body, "isAvailable")) {
      if (typeof req.body.isAvailable !== "boolean") {
        return fail(res, 400, "Product availability must be set to available or not available.");
      }
      if (req.user.role !== "seller" || !isOwner) {
        return fail(res, 403, "Only the seller who owns this product can change its availability.");
      }
      updates.isAvailable = req.body.isAvailable;
    }
    try {
      if (Object.prototype.hasOwnProperty.call(req.body, "occasions")) {
        updates.occasions = parseJsonArray(req.body.occasions, "Celebrations");
        if (!updates.occasions.length || updates.occasions.some((occasion) => typeof occasion !== "string" || !occasion.trim())) {
          return fail(res, 400, "Choose at least one celebration for this product.");
        }
        updates.category = updates.occasions[0];
      }
      if (Object.prototype.hasOwnProperty.call(req.body, "options")) {
        updates.options = parseJsonArray(req.body.options, "Product options");
        if (!validOptions(updates.options)) {
          return fail(res, 400, "Each product option needs a name and at least one choice with a valid extra price.");
        }
      }
    } catch (err) {
      return fail(res, 400, err.message);
    }
    if (req.file) {
      updates.image = `/uploads/products/${req.file.filename}`;
    }

    await product.update(updates);
    return ok(res, product);
  } catch (err) {
    return fail(res, 500, "We couldn't update this product. Please try again.", err);
  }
});

// Product listings are retained for order history; only admins may remove one.
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return fail(res, 404, "That product doesn't exist anymore.");
    }

    await product.destroy();
    return ok(res, { message: "Product removed successfully." });
  } catch (err) {
    return fail(res, 500, "We couldn't delete this product. Please try again.", err);
  }
});

module.exports = router;
// Everything related to browsing and managing the food listings sellers put up.
const express = require("express");
const router = express.Router();
const { Product, User, SearchQuery, ProductView } = require("../models");
const authenticate = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const requireRole = require("../middleware/requireRole");
const { ok, fail } = require("../lib/responses");
const { scoreProduct } = require("../lib/relevance");

// Anyone can browse products — no login needed.
// Supports ?category=Pancit, ?search=lechon, and optional ?buyerLat=&buyerLng=
// to rank results by relevance (keyword match + category + proximity).
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { category, search, sellerId, buyerLat, buyerLng } = req.query;
    const where = {};

    if (category && category !== "All") where.category = category;
    if (sellerId) where.sellerId = sellerId;
    // Note: search is no longer a hard SQL filter — it's scored below so
    // near-matches can still surface, just ranked lower than exact ones.

    const products = await Product.findAll({
      where,
      include: [{
        model: User,
        as: "seller",
        attributes: ["id", "name", "email", "latitude", "longitude"],
      }],
    });

    const lat = buyerLat != null ? parseFloat(buyerLat) : null;
    const lng = buyerLng != null ? parseFloat(buyerLng) : null;

    let ranked = products.map((p) => {
      const plain = p.toJSON();
      const scores = scoreProduct(plain, { term: search, category, buyerLat: lat, buyerLng: lng });
      return { ...plain, ...scores };
    });

    // When a search term was typed, drop results with zero keyword match
    // rather than returning everything regardless of relevance.
    if (search) {
      ranked = ranked.filter((p) => p.keywordScore > 0);
    }

    ranked.sort((a, b) => b.relevanceScore - a.relevanceScore);

    if (!sellerId && (search || category)) {
      SearchQuery.create({
        term: search || null,
        category: category && category !== "All" ? category : null,
        resultCount: ranked.length,
        userId: req.user?.id || null,
      }).catch(() => {});
    }

    return ok(res, ranked);
  } catch (err) {
    return fail(res, 500, "We couldn't load the products right now. Please try again in a moment.", err);
  }
});

// A single product's details — used on the product page.
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: User, as: "seller", attributes: ["id", "name", "email"] }],
    });

    if (!product) {
      return fail(res, 404, "We couldn't find that product — it may have been removed.");
    }

    ProductView.create({
      productId: product.id,
      userId: req.user?.id || null,
    }).catch(() => {});

    return ok(res, product);
  } catch (err) {
    return fail(res, 500, "Something went wrong while loading this product.", err);
  }
});

// Sellers list a new dish here. Buyers and guests can't create products.
router.post("/", authenticate, requireRole("seller"), async (req, res) => {
  try {
    const seller = await User.findByPk(req.user.id);
    if (!seller || seller.verificationStatus !== "approved") {
      return fail(res, 403, "Your seller account is still pending verification. You can list products once it's approved.");
    }

    const { name, description, price, category, image, stock } = req.body;

    if (!name || !price || !category) {
      return fail(res, 400, "Please fill in the product name, price, and category before saving.");
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock: stock ?? 0,
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
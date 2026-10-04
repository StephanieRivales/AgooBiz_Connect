// Handles checkout, and lets buyers/sellers/admins see the orders relevant to them.
const express = require("express");
const router = express.Router();
const { Order, OrderItem, Product, User } = require("../models");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { ok, fail } = require("../lib/responses");

const ORDER_STATUSES = [
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const DELIVERY_FEE = 50;

// ======================================================
// CHECKOUT
// ======================================================

// Buyer checks out their cart — this turns cart items into a real order.
router.post("/", authenticate, requireRole("buyer"), async (req, res) => {
  try {
    const {
      items,
      fullName,
      phone,
      address,
      notes,
      paymentMethod,
    } = req.body;

    // Check if cart has items
    if (!Array.isArray(items) || items.length === 0) {
      return fail(
        res,
        400,
        "Your cart looks empty — add something before checking out."
      );
    }

    // Check customer information
    if (!fullName || !phone || !address) {
      return fail(
        res,
        400,
        "Please provide your name, phone number, and delivery address."
      );
    }

    let itemsTotal = 0;
    const resolvedItems = [];

    // Validate every cart item
    for (const item of items) {
      const { productId, quantity } = item;

      // Check product ID
      if (!productId) {
        return fail(res, 400, "A product in your cart is missing its ID.");
      }

      // Check quantity
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return fail(
          res,
          400,
          "Product quantity must be a positive whole number."
        );
      }

      // Find product
      const product = await Product.findByPk(productId);

      if (!product) {
        return fail(
          res,
          404,
          "One of the items in your cart is no longer available."
        );
      }

      // Calculate total
      itemsTotal += Number(product.price) * quantity;

      resolvedItems.push({
        productId,
        quantity,
        price: product.price,
      });
    }

    // Create order
    const order = await Order.create({
      buyerId: req.user.id,
      total: itemsTotal + DELIVERY_FEE,
      status: "Preparing",
      fullName,
      phone,
      address,
      notes: notes || null,
      paymentMethod: paymentMethod || "cod",
      deliveryFee: DELIVERY_FEE,
    });

    // Create order items
    await OrderItem.bulkCreate(
      resolvedItems.map((item) => ({
        ...item,
        orderId: order.id,
      }))
    );

    // Return complete order
    const fullOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          include: [Product],
        },
      ],
    });

    return ok(res, fullOrder, 201);
  } catch (err) {
    console.error("Checkout error:", err);

    return fail(
      res,
      500,
      "We couldn't place your order. Please try again.",
      err
    );
  }
});

// ======================================================
// GET ORDERS
// ======================================================

// Shows orders relevant to whoever's logged in:
// buyers see their own,
// sellers see orders containing their products,
// admins see everything.
router.get("/", authenticate, async (req, res) => {
  try {
    let orders;

    // ADMIN
    if (req.user.role === "admin") {
      orders = await Order.findAll({
        include: [
          {
            model: OrderItem,
            include: [Product],
          },
          {
            model: User,
            as: "buyer",
            attributes: ["id", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    }

    // BUYER
    else if (req.user.role === "buyer") {
      orders = await Order.findAll({
        where: {
          buyerId: req.user.id,
        },
        include: [
          {
            model: OrderItem,
            include: [Product],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    }

    // SELLER
    else if (req.user.role === "seller") {
      orders = await Order.findAll({
        include: [
          {
            model: OrderItem,
            include: [
              {
                model: Product,
                where: {
                  sellerId: req.user.id,
                },
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    }

    // Unknown role
    else {
      return fail(res, 403, "You are not authorized to view orders.");
    }

    return ok(res, orders);
  } catch (err) {
    console.error("Get orders error:", err);

    return fail(
      res,
      500,
      "We couldn't load your orders right now.",
      err
    );
  }
});

// ======================================================
// UPDATE ORDER STATUS
// ======================================================

// Sellers/admins move an order forward —
// e.g. marking it "Out for Delivery".
router.put(
  "/:id/status",
  authenticate,
  requireRole("seller", "admin"),
  async (req, res) => {
    try {
      const { status } = req.body;

      // Validate status
      if (!ORDER_STATUSES.includes(status)) {
        return fail(
          res,
          400,
          `Status must be one of: ${ORDER_STATUSES.join(", ")}.`
        );
      }

      // Find order
      const order = await Order.findByPk(req.params.id, {
        include: [
          {
            model: OrderItem,
            include: [Product],
          },
        ],
      });

      if (!order) {
        return fail(res, 404, "We couldn't find that order.");
      }

      // ==================================================
      // ADMIN
      // ==================================================

      // Admin can update any order.
      if (req.user.role === "admin") {
        order.status = status;
        await order.save();

        return ok(res, order);
      }

      // ==================================================
      // SELLER
      // ==================================================

      // Seller can only update an order if the order
      // contains at least one of their products.
      if (req.user.role === "seller") {
        const sellerOwnsProduct = order.OrderItems.some(
          (item) =>
            item.Product &&
            Number(item.Product.sellerId) === Number(req.user.id)
        );

        if (!sellerOwnsProduct) {
          return fail(
            res,
            403,
            "You are not authorized to update this order."
          );
        }

        order.status = status;
        await order.save();

        return ok(res, order);
      }

      return fail(res, 403, "You are not authorized to update orders.");
    } catch (err) {
      console.error("Update order status error:", err);

      return fail(
        res,
        500,
        "We couldn't update the order status.",
        err
      );
    }
  }
);

module.exports = router;
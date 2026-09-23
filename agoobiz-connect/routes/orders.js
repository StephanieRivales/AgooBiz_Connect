// Handles checkout, and lets buyers/sellers/admins see the orders relevant to them.
const express = require("express");
const router = express.Router();
const { Order, OrderItem, Product, User } = require("../models");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { ok, fail } = require("../lib/responses");

const ORDER_STATUSES = ["Preparing", "Out for Delivery", "Delivered", "Cancelled"];
const DELIVERY_FEE = 50;

// Buyer checks out their cart — this turns cart items into a real order.
router.post("/", authenticate, requireRole("buyer"), async (req, res) => {
  try {
    const { items, fullName, phone, address, notes, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return fail(res, 400, "Your cart looks empty — add something before checking out.");
    }
    if (!fullName || !phone || !address) {
      return fail(res, 400, "Please provide your name, phone number, and delivery address.");
    }

    let itemsTotal = 0;
    const resolvedItems = [];

    for (const { productId, quantity } of items) {
      const product = await Product.findByPk(productId);
      if (!product) {
        return fail(res, 404, `One of the items in your cart is no longer available.`);
      }
      itemsTotal += product.price * quantity;
      resolvedItems.push({ productId, quantity, price: product.price });
    }

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

    await OrderItem.bulkCreate(
      resolvedItems.map((item) => ({ ...item, orderId: order.id }))
    );

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, include: [Product] }],
    });
    return ok(res, fullOrder, 201);
  } catch (err) {
    return fail(res, 500, "We couldn't place your order. Please try again.", err);
  }
});

// Shows orders relevant to whoever's logged in:
// buyers see their own, sellers see orders containing their products, admins see everything.
router.get("/", authenticate, async (req, res) => {
  try {
    let orders;

    if (req.user.role === "admin") {
      orders = await Order.findAll({
        include: [
          { model: OrderItem, include: [Product] },
          { model: User, as: "buyer", attributes: ["id", "email"] },
        ],
        order: [["createdAt", "DESC"]],
      });
    } else if (req.user.role === "buyer") {
      orders = await Order.findAll({
        where: { buyerId: req.user.id },
        include: [{ model: OrderItem, include: [Product] }],
        order: [["createdAt", "DESC"]],
      });
    } else if (req.user.role === "seller") {
      orders = await Order.findAll({
        include: [
          {
            model: OrderItem,
            include: [{ model: Product, where: { sellerId: req.user.id } }],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    }

    return ok(res, orders);
  } catch (err) {
    return fail(res, 500, "We couldn't load your orders right now.", err);
  }
});

// Shows orders relevant to whoever's logged in:
// buyers see their own, sellers see orders containing their products, admins see everything.
router.get("/", authenticate, async (req, res) => {
  try {
    let orders;

    if (req.user.role === "admin") {
      orders = await Order.findAll({
        include: [OrderItem, { model: User, as: "buyer", attributes: ["id", "email"] }],
      });
    } else if (req.user.role === "buyer") {
      orders = await Order.findAll({
        where: { buyerId: req.user.id },
        include: [OrderItem],
      });
    } else if (req.user.role === "seller") {
      orders = await Order.findAll({
        include: [
          {
            model: OrderItem,
            include: [{ model: Product, where: { sellerId: req.user.id } }],
          },
        ],
      });
    }

    return ok(res, orders);
  } catch (err) {
    return fail(res, 500, "We couldn't load your orders right now.", err);
  }
});

// Sellers/admins move an order forward — e.g. marking it "Out for Delivery".
router.put("/:id/status", authenticate, requireRole("seller", "admin"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
      return fail(res, 400, `Status must be one of: ${ORDER_STATUSES.join(", ")}.`);
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return fail(res, 404, "We couldn't find that order.");
    }

    order.status = status;
    await order.save();

    return ok(res, order);
  } catch (err) {
    return fail(res, 500, "We couldn't update the order status.", err);
  }
});

module.exports = router;
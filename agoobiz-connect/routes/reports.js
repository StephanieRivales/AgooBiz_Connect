// Dashboards and numbers — for admins to see the platform overall,
// and for sellers to see how their own shop is doing.
const express = require("express");
const router = express.Router();
const { fn, col, literal } = require("sequelize");
const { Order, OrderItem, Product, User } = require("../models");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { ok, fail } = require("../lib/response");

// Admin: the big-picture numbers for the whole marketplace.
router.get("/summary", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const [totalUsers, totalSellers, totalOrders, totalRevenue] = await Promise.all([
      User.count(),
      User.count({ where: { role: "seller" } }),
      Order.count(),
      Order.sum("total"),
    ]);

    return ok(res, {
      totalUsers,
      totalSellers,
      totalOrders,
      totalRevenue: totalRevenue || 0,
    });
  } catch (err) {
    return fail(res, 500, "We couldn't generate the summary report.", err);
  }
});

// Admin: sales broken down day by day, for spotting trends.
router.get("/sales", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const sales = await Order.findAll({
      attributes: [
        [fn("DATE", col("createdAt")), "date"],
        [fn("SUM", col("total")), "totalSales"],
        [fn("COUNT", col("id")), "orderCount"],
      ],
      group: [literal('DATE("createdAt")')],
      order: [[literal('DATE("createdAt")'), "DESC"]],
    });
    return ok(res, sales);
  } catch (err) {
    return fail(res, 500, "We couldn't generate the sales report.", err);
  }
});

// Seller: how their own shop is performing.
router.get("/seller", authenticate, requireRole("seller"), async (req, res) => {
  try {
    const orderItems = await OrderItem.findAll({
      include: [
        { model: Product, where: { sellerId: req.user.id } },
        { model: Order, attributes: ["id", "status", "createdAt"] },
      ],
    });

    const totalSales = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItemsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    return ok(res, { totalSales, totalItemsSold, orderItems });
  } catch (err) {
    return fail(res, 500, "We couldn't generate your sales report.", err);
  }
});

module.exports = router;
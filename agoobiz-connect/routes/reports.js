// Dashboards and numbers — for admins to see the platform overall,
// and for sellers to see how their own shop is doing.
const express = require("express");
const router = express.Router();
const { fn, col, literal } = require("sequelize");
const { Order, OrderItem, Product, User } = require("../models");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { ok, fail } = require("../lib/responses");
const { Op } = require("sequelize");

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Top-level numbers: orders this week, week-over-week growth, active sellers.
router.get("/public-summary", async (req, res) => {
  try {
    const startOfWeek = daysAgo(7);
    const startOfPrevWeek = daysAgo(14);

    const ordersThisWeek = await Order.count({
      where: { createdAt: { [Op.gte]: startOfWeek } },
    });
    const ordersPrevWeek = await Order.count({
      where: { createdAt: { [Op.gte]: startOfPrevWeek, [Op.lt]: startOfWeek } },
    });

    const wowGrowth =
      ordersPrevWeek === 0 ? 0 : ((ordersThisWeek - ordersPrevWeek) / ordersPrevWeek) * 100;

    const activeSellers = await Product.count({
      distinct: true,
      col: "sellerId",
    });

    return ok(res, {
      ordersThisWeek,
      wowGrowth: Math.round(wowGrowth * 10) / 10,
      activeSellers,
      updatedAt: new Date(),
    });
  } catch (err) {
    return fail(res, 500, "We couldn't load the analytics summary.", err);
  }
});

// Orders per day for the last 7 days, for the trend chart.
router.get("/weekly-trend", async (req, res) => {
  try {
    const start = daysAgo(6); // today + 6 days back = 7 days total

    const orders = await Order.findAll({
      where: { createdAt: { [Op.gte]: start } },
      attributes: [
        [fn("DATE", col("createdAt")), "date"],
        [fn("COUNT", col("id")), "orderCount"],
      ],
      group: [literal('DATE("createdAt")')],
      order: [[literal('DATE("createdAt")'), "ASC"]],
    });

    // Fill in any missing days with 0 so the chart has a full 7-day run
    const byDate = {};
    orders.forEach((row) => {
      byDate[row.get("date")] = parseInt(row.get("orderCount"), 10);
    });

    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = daysAgo(i);
      const key = d.toISOString().slice(0, 10);
      trend.push({
        date: key,
        dayLabel: d.toLocaleDateString("en-PH", { weekday: "short" }),
        orderCount: byDate[key] || 0,
      });
    }

    return ok(res, trend);
  } catch (err) {
    return fail(res, 500, "We couldn't load the weekly trend.", err);
  }
});

// Orders grouped by product category, with week-over-week growth per category.
router.get("/category-demand", async (req, res) => {
  try {
    const startOfWeek = daysAgo(7);
    const startOfPrevWeek = daysAgo(14);

    const thisWeek = await OrderItem.findAll({
      attributes: [
        [col("Product.category"), "category"],
        [fn("SUM", col("OrderItem.quantity")), "orders"],
      ],
      include: [{ model: Product, attributes: [] }],
      where: { createdAt: { [Op.gte]: startOfWeek } },
      group: ["Product.category"],
      raw: true,
    });

    const prevWeek = await OrderItem.findAll({
      attributes: [
        [col("Product.category"), "category"],
        [fn("SUM", col("OrderItem.quantity")), "orders"],
      ],
      include: [{ model: Product, attributes: [] }],
      where: { createdAt: { [Op.gte]: startOfPrevWeek, [Op.lt]: startOfWeek } },
      group: ["Product.category"],
      raw: true,
    });

    const prevMap = {};
    prevWeek.forEach((row) => {
      prevMap[row.category] = parseInt(row.orders, 10);
    });

    const result = thisWeek
      .map((row) => {
        const current = parseInt(row.orders, 10);
        const previous = prevMap[row.category] || 0;
        const growthPct = previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);
        return { category: row.category, orders: current, growthPct };
      })
      .sort((a, b) => b.orders - a.orders);

    return ok(res, result);
  } catch (err) {
    return fail(res, 500, "We couldn't load category demand.", err);
  }
});

// Top sellers by order volume in the last 7 days.
router.get("/top-sellers", async (req, res) => {
  try {
    const startOfWeek = daysAgo(7);

    const rows = await OrderItem.findAll({
      attributes: [
        [col("Product.sellerId"), "sellerId"],
        [fn("SUM", col("OrderItem.quantity")), "orders"],
      ],
      include: [{ model: Product, attributes: [] }],
      where: { createdAt: { [Op.gte]: startOfWeek } },
      group: ["Product.sellerId"],
      order: [[fn("SUM", col("OrderItem.quantity")), "DESC"]],
      limit: 4,
      raw: true,
    });

    const sellerIds = rows.map((r) => r.sellerId);
    const sellers = await User.findAll({
      where: { id: sellerIds },
      attributes: ["id", "name"],
    });
    const sellerMap = {};
    sellers.forEach((s) => (sellerMap[s.id] = s.name));

    const result = rows.map((r) => ({
      sellerId: r.sellerId,
      name: sellerMap[r.sellerId] || "Unknown Seller",
      orders: parseInt(r.orders, 10),
    }));

    return ok(res, result);
  } catch (err) {
    return fail(res, 500, "We couldn't load top sellers.", err);
  }
});

// Orders grouped by seller's barangay, for the local-demand map.
router.get("/barangay-demand", async (req, res) => {
  try {
    const today = daysAgo(0);

    const rows = await OrderItem.findAll({
      attributes: [
        [col("Product->seller.barangay"), "barangay"],
        [fn("SUM", col("OrderItem.quantity")), "orders"],
      ],
      include: [
        {
          model: Product,
          attributes: [],
          include: [{ model: User, as: "seller", attributes: [] }],
        },
      ],
      where: { createdAt: { [Op.gte]: today } },
      group: ["Product->seller.barangay"],
      order: [[fn("SUM", col("OrderItem.quantity")), "DESC"]],
      raw: true,
    });

    const result = rows
      .filter((r) => r.barangay)
      .map((r) => ({ barangay: r.barangay, orders: parseInt(r.orders, 10) }));

    return ok(res, result);
  } catch (err) {
    return fail(res, 500, "We couldn't load barangay demand.", err);
  }
});

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
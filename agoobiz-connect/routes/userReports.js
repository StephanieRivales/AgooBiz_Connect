const express = require("express");
const router = express.Router();
const { User, UserReport, Product } = require("../models");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { ok, fail } = require("../lib/responses");

const reportReasons = [
  "Harassment or abusive behavior",
  "Fraud or suspicious activity",
  "Unsafe or prohibited products",
  "Repeated order abuse",
  "Other",
];

router.post("/", authenticate, async (req, res) => {
  try {
    const { reportedUserId, productId, reason, details } = req.body;
    if (!Number.isInteger(Number(reportedUserId)) || !reportReasons.includes(reason) ||
        typeof details !== "string" || details.trim().length < 10) {
      return fail(res, 400, "Choose a report reason and provide at least 10 characters of detail.");
    }
    if (Number(reportedUserId) === Number(req.user.id)) {
      return fail(res, 400, "You can't report your own account.");
    }

    const reportedUser = await User.findByPk(reportedUserId);
    if (!reportedUser) return fail(res, 404, "The account you're reporting could not be found.");

    if (productId) {
      const product = await Product.findByPk(productId);
      if (!product || Number(product.sellerId) !== Number(reportedUserId)) {
        return fail(res, 400, "The selected product doesn't belong to the reported account.");
      }
    }

    const report = await UserReport.create({
      reporterId: req.user.id,
      reportedUserId,
      productId: productId || null,
      reason,
      details: details.trim(),
    });
    return ok(res, report, 201);
  } catch (err) {
    return fail(res, 500, "We couldn't submit your report. Please try again.", err);
  }
});

router.get("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const reports = await UserReport.findAll({
      include: [
        { model: User, as: "reporter", attributes: ["id", "name", "email"] },
        { model: User, as: "reportedUser", attributes: ["id", "name", "email", "role", "isActive", "isBlocked"] },
        { model: Product, attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    return ok(res, reports);
  } catch (err) {
    return fail(res, 500, "We couldn't load user reports.", err);
  }
});

router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!["reviewed", "dismissed"].includes(status) ||
        (adminNote !== undefined && typeof adminNote !== "string")) {
      return fail(res, 400, "Choose a valid report outcome and enter a valid admin note.");
    }
    const report = await UserReport.findByPk(req.params.id);
    if (!report) return fail(res, 404, "That report could not be found.");
    await report.update({ status, adminNote: adminNote?.trim() || null });
    return ok(res, report);
  } catch (err) {
    return fail(res, 500, "We couldn't update that report.", err);
  }
});

module.exports = router;

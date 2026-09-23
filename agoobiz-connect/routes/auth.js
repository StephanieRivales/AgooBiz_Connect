const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { ok, fail } = require("../lib/responses");
const upload = require("../middleware/upload");

const router = express.Router();

// POST /api/auth/register
router.post(
  "/register",
  upload.fields([
    { name: "validId", maxCount: 1 },
    { name: "proofOfAddress", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name, email, password, role,
        barangay, address, contactNumber, latitude, longitude,
      } = req.body;

      if (!name || !email || !password) {
        return fail(res, 400, "Name, email, and password are required.");
      }

      const allowedRoles = ["buyer", "seller"];
      const finalRole = allowedRoles.includes(role) ? role : "buyer";

      if (finalRole === "seller") {
        if (!barangay || !address || !contactNumber || !latitude || !longitude) {
          return fail(res, 400, "Sellers must provide barangay, address, contact number, and shop location.");
        }
        if (!req.files?.proofOfAddress || !req.files?.validId) {
          return fail(res, 400, "Sellers must upload proof of address and a valid ID.");
        }
      }

      const existing = await User.findOne({ where: { email } });
      if (existing) return fail(res, 400, "That email is already registered.");

      const hash = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hash,
        role: finalRole,
        barangay: barangay || null,
        address: address || null,
        contactNumber: contactNumber || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        validIdUrl: req.files?.validId ? `/uploads/verification/${req.files.validId[0].filename}` : null,
        proofOfAddressUrl: req.files?.proofOfAddress ? `/uploads/verification/${req.files.proofOfAddress[0].filename}` : null,
        verificationStatus: finalRole === "seller" ? "pending" : "approved",
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "dev-secret",
        { expiresIn: "7d" }
      );

      return ok(res, {
        token,
        user: {
          id: user.id, name: user.name, email: user.email, role: user.role,
          barangay: user.barangay, verificationStatus: user.verificationStatus,
        },
      }, 201);
    } catch (err) {
      return fail(res, 500, "Could not create account.", err);
    }
  }
);

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return fail(res, 400, "Email and password are required.");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return fail(res, 401, "Invalid email or password.");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return fail(res, 401, "Invalid email or password.");

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );

    return ok(res, {
      token,
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role,
        barangay: user.barangay, verificationStatus: user.verificationStatus,
      },
    });
  } catch (err) {
    return fail(res, 500, "Login failed.", err);
  }
});

module.exports = router;
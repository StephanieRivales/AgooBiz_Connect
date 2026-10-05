// One-time script to bootstrap the first admin account.
// Run with: node scripts/createAdmin.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User } = require("../models");

async function createAdmin() {
  const email = "admin@agoobiz.com";       // change this
  const password = "agoobiz123";         // change this before running
  const name = "AgooBiz Admin";

  await sequelize.authenticate();

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log(`A user with email ${email} already exists (role: ${existing.role}).`);
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);

  const admin = await User.create({
    name,
    email,
    password: hash,
    role: "admin",
    verificationStatus: "approved",
  });

  console.log(`Admin account created: ${admin.email} (id: ${admin.id})`);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error("Failed to create admin:", err);
  process.exit(1);
});
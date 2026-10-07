require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { sequelize, User } = require("./models");
const { Op } = require("sequelize");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const productsRoutes = require("./routes/products");
const ordersRoutes = require("./routes/orders");
const messagesRoutes = require("./routes/messages");
const reviewsRoutes = require("./routes/reviews");
const announcementsRoutes = require("./routes/announcements");
const reportsRoutes = require("./routes/reports");
const userReportsRoutes = require("./routes/userReports");

const app = express();
   const PORT = process.env.API_PORT || 5000;

app.use(cors({ origin: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "AgooBiz Connect API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/user-reports", userReportsRoutes);

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    await sequelize.sync({ alter: true });
    await User.update(
      { isBlocked: true, isActive: true },
      {
        where: {
          isActive: false,
          isBlocked: false,
          moderationReason: { [Op.ne]: null },
        },
      }
    );
    console.log("Models synced.");

    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
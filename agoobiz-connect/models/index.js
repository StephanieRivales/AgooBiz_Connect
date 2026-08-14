const sequelize = require("../config/database");
const User = require("./User");
const Product = require("./Product");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Review = require("./Review");
const Announcement = require("./Announcement");
const Message = require("./Message");

// --- User <-> Product (a seller owns many products) ---
User.hasMany(Product, { foreignKey: "sellerId", as: "products" });
Product.belongsTo(User, { foreignKey: "sellerId", as: "seller" });

// --- User <-> Order (a buyer places many orders) ---
User.hasMany(Order, { foreignKey: "buyerId", as: "orders" });
Order.belongsTo(User, { foreignKey: "buyerId", as: "buyer" });

// --- Order <-> OrderItem (an order contains many line items) ---
Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// --- Product <-> OrderItem (a product can appear in many order items) ---
Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

// --- Product <-> Review ---
Product.hasMany(Review, { foreignKey: "productId" });
Review.belongsTo(Product, { foreignKey: "productId" });

// --- User <-> Review (a buyer writes many reviews) ---
User.hasMany(Review, { foreignKey: "buyerId", as: "reviews" });
Review.belongsTo(User, { foreignKey: "buyerId", as: "buyer" });

// --- User <-> Announcement (an admin creates many announcements) ---
User.hasMany(Announcement, { foreignKey: "createdBy" });
Announcement.belongsTo(User, { foreignKey: "createdBy", as: "author" });

// --- User <-> Message (sender/receiver, both point to User) ---
User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
User.hasMany(Message, { foreignKey: "receiverId", as: "receivedMessages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Message.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });

module.exports = {
  sequelize,
  User,
  Product,
  Order,
  OrderItem,
  Review,
  Announcement,
  Message,
};
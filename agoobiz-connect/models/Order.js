const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define("Order", {
  buyerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("Preparing", "Out for Delivery", "Delivered", "Cancelled"),
    allowNull: false,
    defaultValue: "Preparing",
  },
});

module.exports = Order;
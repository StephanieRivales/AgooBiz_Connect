const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserReport = sequelize.define("UserReport", {
  reporterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reportedUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "reviewed", "dismissed"),
    allowNull: false,
    defaultValue: "pending",
  },
  adminNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = UserReport;

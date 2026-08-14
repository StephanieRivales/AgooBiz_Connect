const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Announcement = sequelize.define("Announcement", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER, // admin user id who posted it
    allowNull: false,
  },
});

module.exports = Announcement;
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  barangay: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true, // street/sitio address, required for sellers at the route level
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  validIdUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  proofOfAddressUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  verificationStatus: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    allowNull: false,
    defaultValue: "approved", // buyers skip review; sellers are set to "pending" at signup
  },
  role: {
    type: DataTypes.ENUM("buyer", "seller", "admin"),
    allowNull: false,
    defaultValue: "buyer",
  },
});

module.exports = User;
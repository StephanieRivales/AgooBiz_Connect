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
    allowNull: false, // store a bcrypt hash here, never plain text
  },
  role: {
    type: DataTypes.ENUM("buyer", "seller", "admin"),
    allowNull: false,
    defaultValue: "buyer",
  },
});

module.exports = User;
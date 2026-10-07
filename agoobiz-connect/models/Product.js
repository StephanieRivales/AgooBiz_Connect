const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  occasions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  image: {
    type: DataTypes.STRING, // URL or file path to the product photo
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Product;
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Records each time a product's detail page is viewed. Feeds demand
// analytics, relevance ranking, and personalized recommendations.
const ProductView = sequelize.define("ProductView", {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null for guest views
  },
});

module.exports = ProductView;
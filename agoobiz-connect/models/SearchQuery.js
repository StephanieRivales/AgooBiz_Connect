const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Records each meaningful search/browse request (a typed term or a
// chosen category — not a blank "show everything" load). Feeds relevance
// ranking, demand analytics, and personalized recommendations.
const SearchQuery = sequelize.define("SearchQuery", {
  term: {
    type: DataTypes.STRING,
    allowNull: true, // null when it was a category browse with no typed search
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resultCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = SearchQuery;
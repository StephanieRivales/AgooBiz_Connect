const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Follow = sequelize.define("Follow", {
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  indexes: [{ unique: true, fields: ["followerId", "followingId"] }],
});

module.exports = Follow;

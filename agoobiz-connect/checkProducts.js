require("dotenv").config();
const { sequelize, Product, User } = require("./models");

(async () => {
  try {
    const cols = await sequelize.getQueryInterface().describeTable("Products");
    console.log("COLUMNS:", Object.keys(cols));

    const seller = await User.findOne({ where: { role: "seller" } });
    console.log("seller id:", seller && seller.id);

    const t = await sequelize.transaction();
    try {
      await Product.create(
        { name: "TEST", price: "560", category: "Birthday", sellerId: seller.id },
        { transaction: t }
      );
      console.log("INSERT OK");
    } catch (e) {
      console.log("INSERT FAILED:", e.message);
      if (e.parent) console.log("DATABASE SAYS:", e.parent.message);
    }
    await t.rollback(); // nothing is saved
  } catch (e) {
    console.log("ERROR:", e.message);
  }
  process.exit();
})();
process.env.API_PORT = "5055";          // separate port, won't clash with your running server
require("dotenv").config();
const jwt = require("jsonwebtoken");
require("./index.js");                   // starts a second copy of the API

setTimeout(async () => {
  const token = jwt.sign(
    { id: 2, email: "test@test.com", role: "seller" },   // id 2 = the seller found earlier
    process.env.JWT_SECRET || "dev-secret"
  );

  const form = new FormData();
  form.append("name", "CHECK CAKE");
  form.append("description", "chocolate flavor");
  form.append("category", "Birthday");
  form.append("price", "560");
  form.append("stock", "3");

  const res = await fetch("http://localhost:5055/api/products", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: form,
  });
  console.log("STATUS:", res.status);
  console.log("BODY:", await res.text());
  process.exit();
}, 4000);
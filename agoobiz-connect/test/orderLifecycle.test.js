const test = require("node:test");
const assert = require("node:assert/strict");
const {
  aggregateOrderQuantities,
  getOrderStatusTransitionError,
  reserveProductStock,
} = require("../lib/orderLifecycle");

test("aggregates quantities for repeated product IDs across option variants", () => {
  const quantities = aggregateOrderQuantities([
    { productId: "12", quantity: 2 },
    { productId: 12, quantity: 3 },
    { productId: 17, quantity: 1 },
  ]);

  assert.deepEqual([...quantities], [[12, 5], [17, 1]]);
});

test("reserves stock only when the stock level and availability still match", async () => {
  const transaction = { id: "checkout-transaction" };
  const updates = [];
  const Product = {
    async update(values, options) {
      updates.push({ values, options });
      return [1];
    },
  };

  const reserved = await reserveProductStock(Product, 12, 3, 8, transaction);

  assert.equal(reserved, true);
  assert.deepEqual(updates[0], {
    values: { stock: 5 },
    options: {
      where: { id: 12, stock: 8, isAvailable: true },
      transaction,
    },
  });
});

test("reports a stock reservation conflict when another checkout changed stock", async () => {
  const Product = { async update() { return [0]; } };

  assert.equal(await reserveProductStock(Product, 12, 3, 8, {}), false);
});

test("allows only forward fulfillment transitions and cancellation before dispatch", () => {
  assert.equal(getOrderStatusTransitionError("Preparing", "Out for Delivery"), null);
  assert.equal(getOrderStatusTransitionError("Preparing", "Cancelled"), null);
  assert.equal(getOrderStatusTransitionError("Out for Delivery", "Delivered"), null);
  assert.notEqual(getOrderStatusTransitionError("Out for Delivery", "Cancelled"), null);
  assert.notEqual(getOrderStatusTransitionError("Delivered", "Preparing"), null);
  assert.notEqual(getOrderStatusTransitionError("Cancelled", "Cancelled"), null);
});

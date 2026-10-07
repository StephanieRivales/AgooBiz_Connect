const test = require("node:test");
const assert = require("node:assert/strict");
const { sequelize, Order, OrderItem, Product, User } = require("../models");
const ordersRouter = require("../routes/orders");

const database = {
  products: new Map(),
  orders: new Map(),
  items: [],
  nextOrderId: 1,
};

const originals = {
  transaction: sequelize.transaction,
  orderCreate: Order.create,
  orderFindByPk: Order.findByPk,
  orderItemBulkCreate: OrderItem.bulkCreate,
  orderItemFindAll: OrderItem.findAll,
  productFindByPk: Product.findByPk,
  productUpdate: Product.update,
  userFindByPk: User.findByPk,
};

function makeOrder(values) {
  return {
    ...values,
    async save() {
      database.orders.set(this.id, this);
    },
  };
}

function resetDatabase() {
  database.products = new Map([[
    1,
    {
      id: 1,
      name: "Test Cake",
      price: "100.00",
      stock: 5,
      isAvailable: true,
      sellerId: 20,
      options: [],
      async save() {},
    },
  ]]);
  database.orders = new Map();
  database.items = [];
  database.nextOrderId = 1;
}

function getHandler(method, routePath) {
  const routeLayer = ordersRouter.stack.find((layer) =>
    layer.route?.path === routePath && layer.route.methods[method]
  );
  assert.ok(routeLayer, `Expected route ${method.toUpperCase()} ${routePath}`);
  return routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
}

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

async function invoke(handler, req) {
  const res = createResponse();
  await handler(req, res);
  return res;
}

sequelize.transaction = async (callback) => {
  const productStocks = new Map([...database.products].map(([id, product]) => [id, product.stock]));
  const orderSnapshot = new Map([...database.orders].map(([id, order]) => [id, { ...order }]));
  const itemCount = database.items.length;
  const nextOrderId = database.nextOrderId;
  try {
    return await callback({ LOCK: { UPDATE: "UPDATE" } });
  } catch (error) {
    for (const [id, stock] of productStocks) database.products.get(id).stock = stock;
    database.orders = orderSnapshot;
    database.items.length = itemCount;
    database.nextOrderId = nextOrderId;
    throw error;
  }
};

Order.create = async (values) => {
  const order = makeOrder({ id: database.nextOrderId++, ...values, createdAt: new Date() });
  database.orders.set(order.id, order);
  return order;
};
Order.findByPk = async (id) => database.orders.get(Number(id)) || null;
OrderItem.bulkCreate = async (items) => {
  const created = items.map((item, index) => ({ id: database.items.length + index + 1, ...item }));
  database.items.push(...created);
  return created;
};
OrderItem.findAll = async ({ where, include = [] }) => database.items
  .filter((item) => item.orderId === where.orderId)
  .map((item) => {
    if (!include.length) return item;
    return { ...item, Product: database.products.get(item.productId) };
  })
  .filter((item) => {
    const sellerId = include[0]?.where?.sellerId;
    return sellerId == null || Number(item.Product?.sellerId) === Number(sellerId);
  });
Product.findByPk = async (id) => database.products.get(Number(id)) || null;
Product.update = async (values, { where }) => {
  const product = database.products.get(Number(where.id));
  if (!product || product.stock !== where.stock || product.isAvailable !== where.isAvailable) return [0];
  Object.assign(product, values);
  return [1];
};
User.findByPk = async () => ({ id: 20, name: "Seller", orderCutoffStart: "00:00", orderCutoffEnd: "23:59" });

test.beforeEach(resetDatabase);
test.after(() => {
  sequelize.transaction = originals.transaction;
  Order.create = originals.orderCreate;
  Order.findByPk = originals.orderFindByPk;
  OrderItem.bulkCreate = originals.orderItemBulkCreate;
  OrderItem.findAll = originals.orderItemFindAll;
  Product.findByPk = originals.productFindByPk;
  Product.update = originals.productUpdate;
  User.findByPk = originals.userFindByPk;
});

test("checkout reserves stock and buyer cancellation restores it only once", async () => {
  const createOrder = getHandler("post", "/");
  const checkout = await invoke(createOrder, {
    user: { id: 7, role: "buyer" },
    body: {
      items: [{ productId: 1, quantity: 2 }],
      fullName: "Test Buyer",
      phone: "09123456789",
      address: "Agoo, La Union",
      requestedDeliveryAt: "2099-12-20T12:00",
    },
  });

  assert.equal(checkout.statusCode, 201);
  assert.equal(database.products.get(1).stock, 3);
  assert.equal(database.orders.get(1).paymentMethod, "pending");

  const cancelOrder = getHandler("put", "/:id/cancel");
  const cancellation = await invoke(cancelOrder, {
    params: { id: 1 },
    user: { id: 7, role: "buyer" },
  });
  assert.equal(cancellation.statusCode, 200);
  assert.equal(database.products.get(1).stock, 5);

  const duplicateCancellation = await invoke(cancelOrder, {
    params: { id: 1 },
    user: { id: 7, role: "buyer" },
  });
  assert.equal(duplicateCancellation.statusCode, 409);
  assert.equal(database.products.get(1).stock, 5);
});

test("invalid item options roll back the reserved inventory", async () => {
  const product = database.products.get(1);
  product.options = [{
    name: "Size",
    choices: [{ name: "Large", extraPrice: 30 }],
  }];

  const checkout = await invoke(getHandler("post", "/"), {
    user: { id: 7, role: "buyer" },
    body: {
      items: [{ productId: 1, quantity: 2, selectedOptions: [{ name: "Size", choice: "Invalid" }] }],
      fullName: "Test Buyer",
      phone: "09123456789",
      address: "Agoo, La Union",
      requestedDeliveryAt: "2099-12-20T12:00",
    },
  });

  assert.equal(checkout.statusCode, 400);
  assert.equal(product.stock, 5);
  assert.equal(database.orders.size, 0);
});

test("buyers cannot cancel another buyer's order", async () => {
  database.orders.set(1, makeOrder({ id: 1, buyerId: 99, status: "Preparing" }));
  const cancellation = await invoke(getHandler("put", "/:id/cancel"), {
    params: { id: 1 },
    user: { id: 7, role: "buyer" },
  });

  assert.equal(cancellation.statusCode, 403);
  assert.equal(database.products.get(1).stock, 5);
});

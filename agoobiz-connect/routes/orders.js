// Handles checkout, and lets buyers/sellers/admins see the orders relevant to them.
const express = require("express");
const router = express.Router();
const { sequelize, Order, OrderItem, Product, User } = require("../models");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { ok, fail } = require("../lib/responses");
const {
  aggregateOrderQuantities,
  getOrderStatusTransitionError,
  reserveProductStock,
} = require("../lib/orderLifecycle");

const ORDER_STATUSES = ["Preparing", "Out for Delivery", "Delivered", "Cancelled"];
const DELIVERY_FEE = 50;

function orderError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function restoreOrderStock(orderId, transaction) {
  const orderItems = await OrderItem.findAll({
    where: { orderId },
    transaction,
  });
  const restockQuantities = aggregateOrderQuantities(orderItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  })));
  for (const [productId, quantity] of restockQuantities) {
    const product = await Product.findByPk(productId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!product) {
      throw orderError(409, "An ordered product could not be restocked. Please contact support.");
    }
    product.stock = Number(product.stock) + quantity;
    await product.save({ transaction });
  }
}

function parseManilaDateTime(value) {
  const match = typeof value === "string" &&
    value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;

  const [, year, month, day, hour, minute] = match.map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  if (calendarDate.getUTCFullYear() !== year ||
      calendarDate.getUTCMonth() !== month - 1 ||
      calendarDate.getUTCDate() !== day ||
      hour > 23 || minute > 59) return null;

  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute));
}

function manilaTimeNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = parts.find((part) => part.type === "hour").value;
  const minute = parts.find((part) => part.type === "minute").value;
  return `${hour}:${minute}`;
}

function resolveSelectedOptions(product, selectedOptions) {
  const productOptions = Array.isArray(product.options) ? product.options : [];
  if (!Array.isArray(selectedOptions) || selectedOptions.length !== productOptions.length) {
    return null;
  }

  let extraPrice = 0;
  const resolved = [];
  for (const productOption of productOptions) {
    const selection = selectedOptions.find((option) => option.name === productOption.name);
    if (!selection) return null;
    const choice = productOption.choices.find((entry) => entry.name === selection.choice);
    if (!choice) return null;
    const price = Number(choice.extraPrice);
    if (!Number.isFinite(price) || price < 0) return null;
    extraPrice += price;
    resolved.push({
      name: productOption.name,
      choice: choice.name,
      extraPrice: price,
    });
  }
  return { options: resolved, extraPrice };
}

// Buyer checks out their cart — this turns cart items into a real order.
router.post("/", authenticate, requireRole("buyer"), async (req, res) => {
  try {
    const { items, fullName, phone, address, notes, paymentMethod, requestedDeliveryAt } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return fail(res, 400, "Your cart looks empty — add something before checking out.");
    }
    if (!fullName || !phone || !address) {
      return fail(res, 400, "Please provide your name, phone number, and delivery address.");
    }
    const deliveryAt = parseManilaDateTime(requestedDeliveryAt);
    if (!deliveryAt || deliveryAt.getTime() <= Date.now()) {
      return fail(res, 400, "Choose a valid delivery date and time in the future.");
    }

    for (const item of items) {
      if (!item || typeof item !== "object") {
        return fail(res, 400, "Each item in the cart must be valid.");
      }
      const { productId, quantity } = item;
      if (!Number.isInteger(Number(productId)) || Number(productId) < 1) {
        return fail(res, 400, "Each item must refer to a valid product.");
      }
      if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
        return fail(res, 400, "Each item must have a valid quantity.");
      }
    }

    const requestedQuantities = aggregateOrderQuantities(items);
    const transactionResult = await sequelize.transaction(async (transaction) => {
      let itemsTotal = 0;
      const resolvedItems = [];
      const checkedSellers = new Map();
      const products = new Map();
      const currentManilaTime = manilaTimeNow();

      for (const productId of [...requestedQuantities.keys()].sort((a, b) => a - b)) {
        const product = await Product.findByPk(productId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!product) {
          throw orderError(404, "One of the items in your cart is no longer available.");
        }
        const quantity = requestedQuantities.get(productId);
        if (!product.isAvailable) {
          throw orderError(400, `${product.name} is currently not available for ordering.`);
        }
        if (Number(product.stock) < quantity) {
          throw orderError(400, `${product.name} does not have enough stock for this order.`);
        }

        if (!checkedSellers.has(product.sellerId)) {
          const seller = await User.findByPk(product.sellerId, { transaction });
          if (!seller || currentManilaTime < seller.orderCutoffStart || currentManilaTime >= seller.orderCutoffEnd) {
            throw orderError(400, `${seller?.name || "A seller"} is not accepting orders right now. Their order hours are ${seller?.orderCutoffStart || "05:00"}–${seller?.orderCutoffEnd || "20:00"} (Agoo time).`);
          }
          checkedSellers.set(product.sellerId, seller);
        }
        products.set(productId, product);
      }

      for (const [productId, quantity] of requestedQuantities) {
        const product = products.get(productId);
        const reserved = await reserveProductStock(
          Product,
          productId,
          quantity,
          Number(product.stock),
          transaction
        );
        if (!reserved) {
          throw orderError(409, `${product.name} stock just changed. Please review your cart and try again.`);
        }
      }

      for (const item of items) {
        const product = products.get(Number(item.productId));
        const selection = resolveSelectedOptions(product, item.selectedOptions || []);
        if (!selection) {
          throw orderError(400, `Choose a valid option for ${product.name} before ordering.`);
        }
        const price = Number(product.price) + selection.extraPrice;
        itemsTotal += price * Number(item.quantity);
        resolvedItems.push({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          price,
          selectedOptions: selection.options,
        });
      }

      const order = await Order.create({
        buyerId: req.user.id,
        total: itemsTotal + DELIVERY_FEE,
        status: "Preparing",
        fullName,
        phone,
        address,
        notes: notes || null,
        paymentMethod: paymentMethod || "pending",
        deliveryFee: DELIVERY_FEE,
        requestedDeliveryAt: deliveryAt,
      }, { transaction });

      await OrderItem.bulkCreate(
        resolvedItems.map((item) => ({ ...item, orderId: order.id })),
        { transaction }
      );
      return order.id;
    });

    const fullOrder = await Order.findByPk(transactionResult, {
      include: [{ model: OrderItem, include: [Product] }],
    });
    return ok(res, fullOrder, 201);
  } catch (err) {
    if (err.status) return fail(res, err.status, err.message);
    return fail(res, 500, "We couldn't place your order. Please try again.", err);
  }
});

// Buyers see their own orders; sellers see orders containing their products.
router.get("/", authenticate, requireRole("buyer", "seller"), async (req, res) => {
  try {
    let orders;

    if (req.user.role === "buyer") {
      orders = await Order.findAll({
        where: { buyerId: req.user.id },
        include: [{ model: OrderItem, include: [Product] }],
        order: [["createdAt", "DESC"]],
      });
    } else if (req.user.role === "seller") {
      orders = await Order.findAll({
        include: [
          { model: User, as: "buyer", attributes: ["id", "name", "email"] },
          {
            model: OrderItem,
            include: [{ model: Product, where: { sellerId: req.user.id } }],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    }

    return ok(res, orders);
  } catch (err) {
    return fail(res, 500, "We couldn't load your orders right now.", err);
  }
});

router.put("/:id/cancel", authenticate, requireRole("buyer"), async (req, res) => {
  try {
    const cancelledOrder = await sequelize.transaction(async (transaction) => {
      const order = await Order.findByPk(req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!order) throw orderError(404, "We couldn't find that order.");
      if (Number(order.buyerId) !== Number(req.user.id)) {
        throw orderError(403, "You can only cancel your own orders.");
      }
      if (order.status !== "Preparing") {
        throw orderError(409, "Orders can only be cancelled while they are still being prepared.");
      }

      await restoreOrderStock(order.id, transaction);
      order.status = "Cancelled";
      await order.save({ transaction });
      return order;
    });
    return ok(res, cancelledOrder);
  } catch (err) {
    if (err.status) return fail(res, err.status, err.message);
    return fail(res, 500, "We couldn't cancel this order.", err);
  }
});

// Sellers move an order forward; cancellation restores stock exactly once.
router.put("/:id/status", authenticate, requireRole("seller"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
      return fail(res, 400, `Status must be one of: ${ORDER_STATUSES.join(", ")}.`);
    }

    const updatedOrder = await sequelize.transaction(async (transaction) => {
      const order = await Order.findByPk(req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!order) throw orderError(404, "We couldn't find that order.");

      const sellerItems = await OrderItem.findAll({
        where: { orderId: order.id },
        include: [{ model: Product, where: { sellerId: req.user.id }, required: true }],
        transaction,
        limit: 1,
      });
      if (sellerItems.length === 0) {
        throw orderError(403, "You can only update orders containing your products.");
      }

      const transitionError = getOrderStatusTransitionError(order.status, status);
      if (transitionError) throw orderError(409, transitionError);

      if (status === "Cancelled") {
        const orderProducts = await OrderItem.findAll({
          where: { orderId: order.id },
          include: [{ model: Product, attributes: ["sellerId"], required: true }],
          transaction,
        });
        if (orderProducts.some((item) => Number(item.Product.sellerId) !== Number(req.user.id))) {
          throw orderError(409, "The buyer must cancel an order containing products from multiple sellers.");
        }
        await restoreOrderStock(order.id, transaction);
      }

      order.status = status;
      await order.save({ transaction });
      return order;
    });
    return ok(res, updatedOrder);
  } catch (err) {
    if (err.status) return fail(res, err.status, err.message);
    return fail(res, 500, "We couldn't update the order status.", err);
  }
});

module.exports = router;
function aggregateOrderQuantities(items) {
  const quantities = new Map();
  for (const item of items) {
    const productId = Number(item.productId);
    quantities.set(productId, (quantities.get(productId) || 0) + Number(item.quantity));
  }
  return quantities;
}

async function reserveProductStock(Product, productId, quantity, expectedStock, transaction) {
  const [updatedCount] = await Product.update(
    { stock: expectedStock - quantity },
    {
      where: { id: productId, stock: expectedStock, isAvailable: true },
      transaction,
    }
  );
  return updatedCount === 1;
}

function getOrderStatusTransitionError(currentStatus, nextStatus) {
  const allowedTransitions = {
    Preparing: ["Out for Delivery", "Cancelled"],
    "Out for Delivery": ["Delivered"],
    Delivered: [],
    Cancelled: [],
  };
  if (allowedTransitions[currentStatus]?.includes(nextStatus)) return null;
  return `An order can only move from ${currentStatus} to an allowed next status.`;
}

module.exports = {
  aggregateOrderQuantities,
  getOrderStatusTransitionError,
  reserveProductStock,
};

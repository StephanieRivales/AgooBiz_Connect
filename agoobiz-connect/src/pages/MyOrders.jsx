import "../App.css";

// TODO: replace with real orders fetched from your backend for the logged-in buyer
const sampleOrders = [
  {
    id: "ORD-1001",
    date: "2026-08-05",
    status: "Delivered",
    total: 370,
    items: [
      { name: "Pancit Canton", quantity: 2 },
      { name: "Bibingka", quantity: 1 },
    ],
  },
  {
    id: "ORD-1002",
    date: "2026-08-08",
    status: "Preparing",
    total: 250,
    items: [{ name: "Lechon Kawali", quantity: 1 }],
  },
];

const statusColors = {
  Delivered: "status-delivered",
  Preparing: "status-preparing",
  Cancelled: "status-cancelled",
};

export default function MyOrders() {
  if (sampleOrders.length === 0) {
    return (
      <section className="orders-page">
        <h2 className="shop-title">My Orders</h2>
        <p className="empty-state">You haven't placed any orders yet.</p>
      </section>
    );
  }

  return (
    <section className="orders-page">
      <h2 className="shop-title">My Orders</h2>

      <div className="order-list">
        {sampleOrders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-card-header">
              <div>
                <h4>{order.id}</h4>
                <p className="order-date">{order.date}</p>
              </div>
              <span className={`order-status ${statusColors[order.status] || ""}`}>
                {order.status}
              </span>
            </div>

            <ul className="order-items-list">
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.quantity}x {item.name}
                </li>
              ))}
            </ul>

            <div className="order-card-footer">
              <span>Total</span>
              <span className="cart-total-amount">₱{order.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
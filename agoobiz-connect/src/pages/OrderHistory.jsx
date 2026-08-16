import { useState, useEffect } from "react";
import { ordersApi } from "../api/ordersApi";
import "../App.css";

const statusColors = {
  Delivered: "status-delivered",
  Preparing: "status-preparing",
  "Out for Delivery": "status-preparing",
  Cancelled: "status-cancelled",
};

const filterTabs = ["All", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersApi.getAll();
        setOrders(data);
      } catch (err) {
        setError("We couldn't load your orders right now. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders =
    activeFilter === "All"
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="orders-page">
      <h2 className="shop-title">Order History</h2>

      <div className="order-filter-tabs">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            className={`order-filter-tab ${activeFilter === tab ? "active" : ""}`}
            onClick={() => setActiveFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="empty-state">Loading your orders...</p>
      ) : error ? (
        <p className="empty-state">{error}</p>
      ) : filteredOrders.length === 0 ? (
        <p className="empty-state">
          {orders.length === 0
            ? "You haven't placed any orders yet."
            : "No orders match this filter."}
        </p>
      ) : (
        <div className="order-list">
          {filteredOrders.map((order) => (
            <div className="order-card" key={order.id}>
              <button
                className="order-card-header order-card-toggle"
                onClick={() => toggleExpand(order.id)}
              >
                <div>
                  <h4>Order #{order.id}</h4>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="order-header-right">
                  <span className={`order-status ${statusColors[order.status] || ""}`}>
                    {order.status}
                  </span>
                  <span className="order-expand-icon">
                    {expandedId === order.id ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {expandedId === order.id && (
                <div className="order-card-details">
                  <ul className="order-items-list">
                    {order.OrderItems?.map((item) => (
                      <li key={item.id}>
                        <span>
                          {item.quantity}x {item.Product?.name || "Product"}
                        </span>
                        <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>

                  {order.address && (
                    <div className="order-meta">
                      <p><strong>Delivery Address:</strong> {order.address}</p>
                      {order.paymentMethod && (
                        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="order-card-footer">
                <span>Total</span>
                <span className="cart-total-amount">₱{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

import { useEffect, useState } from "react";
import { ordersApi } from "../api/ordersApi";
import "../App.css";

const statusColors = {
  Delivered: "status-delivered",
  Preparing: "status-preparing",
  "Out for Delivery": "status-preparing",
  Cancelled: "status-cancelled",
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await ordersApi.getAll();
        if (!cancelled) setOrders(data || []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "We couldn't load your orders right now."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="orders-page">
        <h2 className="shop-title">My Orders</h2>
        <p className="empty-state">Loading your orders...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="orders-page">
        <h2 className="shop-title">My Orders</h2>
        <p className="auth-error">{error}</p>
      </section>
    );
  }

  if (orders.length === 0) {
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
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-card-header">
              <div>
                <h4>Order #{order.id}</h4>
                <p className="order-date">
                  {new Date(order.createdAt).toLocaleDateString("en-PH", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </p>
              </div>
              <span className={`order-status ${statusColors[order.status] || ""}`}>
                {order.status}
              </span>
            </div>

            <ul className="order-items-list">
              {(order.OrderItems || []).map((item) => (
                <li key={item.id}>
                  {item.quantity}x {item.Product?.name || "Item no longer available"}
                </li>
              ))}
            </ul>

            <div className="order-card-footer">
              <span>Total</span>
              <span className="cart-total-amount">₱{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
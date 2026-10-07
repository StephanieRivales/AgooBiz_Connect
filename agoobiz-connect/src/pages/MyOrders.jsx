import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await ordersApi.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(err.response?.data?.message || "We couldn't load your orders right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const cancelOrder = async (orderId) => {
    setCancellingOrderId(orderId);
    setActionError("");
    try {
      const updated = await ordersApi.cancel(orderId);
      setOrders((current) => current.map((order) =>
        order.id === orderId ? { ...order, status: updated.status } : order
      ));
    } catch (err) {
      setActionError(err.response?.data?.message || "We couldn't cancel this order.");
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (loading) {
    return (
      <section className="orders-page">
        <h2 className="shop-title">My Orders</h2>
        <p className="empty-state">Loading your orders...</p>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="orders-page">
        <h2 className="shop-title">My Orders</h2>
        <p className="auth-error">{loadError}</p>
        <button type="button" className="orders-retry-button" onClick={loadOrders} disabled={loading}>
          {loading ? "Loading..." : "Try again"}
        </button>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="orders-page">
        <h2 className="shop-title">My Orders</h2>
        <p className="empty-state">You haven't placed any orders yet.</p>
        <Link to="/shop" className="orders-browse-link">Browse products</Link>
      </section>
    );
  }

  return (
    <section className="orders-page">
      <h2 className="shop-title">My Orders</h2>

      <div className="order-list">
        {actionError && <p className="auth-error" role="alert">{actionError}</p>}
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
                  <span>
                    {item.quantity}x {item.Product?.name || "Item no longer available"}
                    {Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0 && (
                      <small className="order-item-options">
                        {item.selectedOptions.map((option) => `${option.name}: ${option.choice}`).join(" · ")}
                      </small>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            {order.requestedDeliveryAt && (
              <p className="order-requested-arrival">
                Requested arrival: {new Date(order.requestedDeliveryAt).toLocaleString("en-PH", {
                  timeZone: "Asia/Manila",
                  dateStyle: "medium",
                  timeStyle: "short",
                })} (Agoo time)
              </p>
            )}
            {order.paymentMethod && (
              <p className="order-requested-arrival">
                Payment method: {order.paymentMethod === "pending" ? "To be decided" : order.paymentMethod}
              </p>
            )}
            {order.status === "Preparing" && (
              <button
                type="button"
                className="buyer-cancel-order"
                disabled={cancellingOrderId === order.id}
                onClick={() => cancelOrder(order.id)}
              >
                {cancellingOrderId === order.id ? "Cancelling..." : "Cancel order"}
              </button>
            )}

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
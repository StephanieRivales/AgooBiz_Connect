import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../api/ordersApi";
import { usersApi } from "../api/usersApi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Icon from "../components/Icon";
import "../App.css";

const activeStatuses = new Set(["Preparing", "Out for Delivery"]);

const statusClasses = {
  Preparing: "buyer-order-status-preparing",
  "Out for Delivery": "buyer-order-status-delivery",
  Delivered: "buyer-order-status-delivered",
  Cancelled: "buyer-order-status-cancelled",
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(value) {
  return `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { cart } = useCart();
  const [orders, setOrders] = useState([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [ordersLoadError, setOrdersLoadError] = useState("");
  const [followingLoadError, setFollowingLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    const [ordersResult, followingResult] = await Promise.allSettled([
      ordersApi.getAll(),
      usersApi.getFollowing(),
    ]);

    const errors = [];
    if (ordersResult.status === "fulfilled") {
      setOrders(Array.isArray(ordersResult.value) ? ordersResult.value : []);
      setOrdersLoadError("");
    } else {
      const message = ordersResult.reason?.response?.data?.message || "We couldn't load your orders.";
      setOrdersLoadError(message);
      errors.push(message);
    }

    if (followingResult.status === "fulfilled") {
      setFollowingCount(Array.isArray(followingResult.value) ? followingResult.value.length : 0);
      setFollowingLoadError(false);
    } else {
      setFollowingLoadError(true);
      errors.push(followingResult.reason?.response?.data?.message || "We couldn't load who you're following.");
    }

    setError(errors.join(" "));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const activeOrders = orders.filter((order) => activeStatuses.has(order.status));
  const totalSpent = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((total, order) => total + Number(order.total || 0), 0);
  const cartItemCount = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const recentOrders = [...orders]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 4);

  const metrics = [
    { label: "Orders in progress", value: ordersLoadError ? "—" : activeOrders.length, icon: "package", href: "/my-orders" },
    { label: "Total spent", value: ordersLoadError ? "—" : formatCurrency(totalSpent), icon: "receipt", href: "/my-orders" },
    { label: "Items in your cart", value: cartItemCount, icon: "shopping", href: "/cart" },
    { label: "Following", value: followingLoadError ? "—" : followingCount, icon: "users", href: "/people" },
  ];

  return (
    <main className="dashboard-page buyer-dashboard">
      <section className="buyer-dashboard-hero">
        <div className="buyer-dashboard-hero-copy">
          <span className="buyer-dashboard-eyebrow">Your AgooBiz account</span>
          <h1>Welcome back, {user?.name || "Buyer"}</h1>
          <p>Discover local favorites, keep track of deliveries, and find your next celebration treat.</p>
        </div>
        <div className="buyer-dashboard-hero-actions">
          <Link to="/shop" className="buyer-dashboard-primary-action">
            <Icon name="search" size={18} /> Browse the shop
          </Link>
          <Link to="/my-orders" className="buyer-dashboard-secondary-action">
            Track orders
          </Link>
        </div>
      </section>

      {error && (
        <div className="buyer-dashboard-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={loadDashboard} disabled={loading}>
            Try again
          </button>
        </div>
      )}

      <section className="buyer-metric-grid" aria-label="Your shopping overview">
        {metrics.map((metric) => (
          <Link className="buyer-metric-card" to={metric.href} key={metric.label}>
            <span className="buyer-metric-icon"><Icon name={metric.icon} size={21} /></span>
            <span className="buyer-metric-copy">
              <span className="buyer-metric-value">{loading ? "—" : metric.value}</span>
              <span className="buyer-metric-label">{metric.label}</span>
            </span>
            <Icon name="arrowUpRight" size={17} className="buyer-metric-arrow" />
          </Link>
        ))}
      </section>

      <section className="buyer-dashboard-section">
        <div className="buyer-section-heading">
          <div>
            <span className="buyer-dashboard-eyebrow">Stay up to date</span>
            <h2>Recent orders</h2>
          </div>
          <Link to="/my-orders" className="buyer-section-link">View all orders</Link>
        </div>

        {ordersLoadError ? (
          <p className="buyer-dashboard-message">{ordersLoadError} Use the retry button above to try again.</p>
        ) : loading ? (
          <p className="buyer-dashboard-message">Loading your orders...</p>
        ) : recentOrders.length === 0 ? (
          <div className="buyer-dashboard-empty">
            <span className="buyer-empty-icon"><Icon name="package" size={24} /></span>
            <div>
              <h3>Your order list is ready</h3>
              <p>When you place an order, its status and delivery details will appear here.</p>
            </div>
            <Link to="/shop" className="buyer-section-link">Explore the shop</Link>
          </div>
        ) : (
          <div className="buyer-recent-orders">
            {recentOrders.map((order) => {
              const itemCount = (order.OrderItems || []).reduce(
                (total, item) => total + Number(item.quantity || 0),
                0
              );
              return (
                <article className="buyer-recent-order" key={order.id}>
                  <span className="buyer-order-icon"><Icon name="receipt" size={19} /></span>
                  <div className="buyer-order-main">
                    <h3>Order #{order.id}</h3>
                    <p>{itemCount} {itemCount === 1 ? "item" : "items"} <span aria-hidden="true">·</span> {formatDate(order.createdAt)}</p>
                    {order.requestedDeliveryAt && (
                      <p className="buyer-order-arrival">
                        <Icon name="clock" size={14} /> Arrival requested {new Date(order.requestedDeliveryAt).toLocaleString("en-PH", {
                          timeZone: "Asia/Manila",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                  </div>
                  <span className={`buyer-order-status ${statusClasses[order.status] || ""}`}>
                    {order.status}
                  </span>
                  <strong className="buyer-order-total">{formatCurrency(order.total)}</strong>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="buyer-dashboard-help">
        <div>
          <span className="buyer-dashboard-eyebrow">Make it a little easier</span>
          <h2>Need help or looking for someone?</h2>
          <p>Message sellers about their products, discover community members, or update your account details.</p>
        </div>
        <div className="buyer-help-actions">
          <Link to="/people"><Icon name="users" size={17} /> Find people</Link>
          <Link to="/chat"><Icon name="message" size={17} /> Messages</Link>
          <Link to="/settings"><Icon name="settings" size={17} /> Account settings</Link>
        </div>
      </section>
    </main>
  );
}

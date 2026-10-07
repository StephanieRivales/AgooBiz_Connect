import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ordersApi } from "../api/ordersApi";
import { productsApi } from "../api/productsApi";
import { reportsApi } from "../api/reportsApi";
import Icon from "../components/Icon";
import "../App.css";
import "../styles/seller-dashboard.css";

function manilaDateKey(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type) => parts.find((entry) => entry.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

const orderStatusClass = {
  Preparing: "preparing",
  "Out for Delivery": "delivery",
  Delivered: "delivered",
  Cancelled: "cancelled",
};

export default function SellerDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [orders, products, sales] = await Promise.all([
        ordersApi.getAll(),
        productsApi.getMine(user.id),
        reportsApi.getSellerSummary(),
      ]);
      setDashboard({
        orders: Array.isArray(orders) ? orders : [],
        products: Array.isArray(products) ? products : [],
        sales,
      });
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't load your seller overview.");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const orders = dashboard?.orders || [];
  const products = dashboard?.products || [];
  const saleItems = dashboard?.sales?.orderItems || [];
  const todayKey = manilaDateKey();
  const todayOrders = orders.filter((order) => manilaDateKey(new Date(order.createdAt)) === todayKey);
  const pendingOrders = orders.filter((order) => order.status === "Preparing");
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklySales = saleItems.reduce((sum, item) => {
    const date = new Date(item.Order?.createdAt || item.createdAt).getTime();
    return date >= weekStart ? sum + Number(item.price) * Number(item.quantity) : sum;
  }, 0);
  const availableProducts = products.filter((product) => product.isAvailable && Number(product.stock) > 0).length;
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <main className="seller-overview">
      <header className="seller-overview-header">
        <div>
          <span className="seller-overview-eyebrow"><Icon name="store" size={16} /> Seller workspace</span>
          <h1>Welcome back, {user?.name || "Seller"}</h1>
          <p>Keep your listings fresh, stay on top of orders, and take care of your customers.</p>
        </div>
        <div className="seller-overview-header-actions">
          <button type="button" className="seller-refresh-button" onClick={loadDashboard} disabled={loading}>
            <Icon name="activity" size={17} /> {loading ? "Refreshing..." : "Refresh"}
          </button>
          <Link to="/my-products" className="seller-primary-link"><Icon name="package" size={17} /> Manage products</Link>
        </div>
      </header>

      {user?.verificationStatus !== "approved" && (
        <div className="seller-verification-notice">
          <Icon name="clock" size={18} />
          <span>Your seller account is {user?.verificationStatus || "pending"} verification. Product publishing is available after approval.</span>
        </div>
      )}

      {error && (
        <div className="seller-dashboard-error">
          <p>{error}</p>
          <button type="button" onClick={loadDashboard}>Try again</button>
        </div>
      )}

      {loading && !dashboard ? (
        <p className="seller-dashboard-loading">Loading your shop overview...</p>
      ) : (
        <>
          <section className="seller-metric-grid" aria-label="Shop overview">
            <article className="seller-metric-card">
              <span className="seller-metric-icon orange"><Icon name="receipt" size={21} /></span>
              <div><strong>{todayOrders.length}</strong><span>Orders today</span></div>
            </article>
            <article className="seller-metric-card">
              <span className="seller-metric-icon blue"><Icon name="clock" size={21} /></span>
              <div><strong>{pendingOrders.length}</strong><span>Needs preparation</span></div>
            </article>
            <article className="seller-metric-card">
              <span className="seller-metric-icon green"><Icon name="package" size={21} /></span>
              <div><strong>{availableProducts}<small> / {products.length}</small></strong><span>Available listings</span></div>
            </article>
            <article className="seller-metric-card">
              <span className="seller-metric-icon gold"><Icon name="chart" size={21} /></span>
              <div><strong>₱{weeklySales.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><span>Sales · past 7 days</span></div>
            </article>
          </section>

          <section className="seller-action-grid" aria-label="Seller tools">
            <Link to="/orders" className="seller-action-card">
              <span className="seller-action-icon"><Icon name="receipt" size={20} /></span>
              <span><strong>Manage orders</strong><small>Review delivery requests and order status</small></span>
              <Icon name="arrowUpRight" size={17} />
            </Link>
            <Link to="/my-products" className="seller-action-card">
              <span className="seller-action-icon"><Icon name="package" size={20} /></span>
              <span><strong>Products &amp; availability</strong><small>Edit listings, stock, and availability</small></span>
              <Icon name="arrowUpRight" size={17} />
            </Link>
            <Link to="/chat" className="seller-action-card">
              <span className="seller-action-icon"><Icon name="message-circle" size={20} /></span>
              <span><strong>Messages</strong><small>Talk with buyers and local businesses</small></span>
              <Icon name="arrowUpRight" size={17} />
            </Link>
            <Link to="/settings" className="seller-action-card">
              <span className="seller-action-icon"><Icon name="settings" size={20} /></span>
              <span><strong>Shop settings</strong><small>Update your profile and order hours</small></span>
              <Icon name="arrowUpRight" size={17} />
            </Link>
          </section>

          <section className="seller-recent-orders">
            <div className="seller-section-heading">
              <div><span>Order activity</span><h2>Recent orders</h2></div>
              <Link to="/orders">View all orders <Icon name="arrowUpRight" size={16} /></Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="seller-orders-empty">
                <Icon name="receipt" size={24} />
                <strong>No orders yet</strong>
                <span>Orders for your products will appear here.</span>
              </div>
            ) : (
              <div className="seller-recent-order-list">
                {recentOrders.map((order) => (
                  <article className="seller-recent-order" key={order.id}>
                    <span className="seller-order-icon"><Icon name="receipt" size={18} /></span>
                    <div className="seller-order-info">
                      <strong>Order #{order.id}</strong>
                      <span>{order.buyer?.name || order.fullName || "Buyer"} · {new Date(order.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span>
                    </div>
                    <strong className="seller-order-total">₱{Number(order.total).toFixed(2)}</strong>
                    <span className={`seller-order-status ${orderStatusClass[order.status] || ""}`}>{order.status}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

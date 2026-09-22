import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

const categoryPills = [
  "Puto Bumbong", "Lechon Manok", "Ensaymada", "Barako Coffee",
  "Lumpiang Sariwa", "Leche Flan", "Longganisa", "Sinigang",
  "Chicharon", "Palitaw", "Kare-Kare", "Pandesal",
];

export default function Home() {
  const { user } = useAuth();
  const role = user?.role || "guest";
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", "Kakanin", "Ulam", "Pastries", "Beverages", "Snacks", "Frozen"];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(category)}`);
  };

  const handlePillClick = (pill) => {
    navigate(`/shop?search=${encodeURIComponent(pill)}`);
  };

    if (role === "seller") {
    const stats = [
      { label: "Orders Today", value: "5", icon: "📦", change: "+2 from yesterday" },
      { label: "Pending Orders", value: "2", icon: "⏳", change: "Need attention" },
      { label: "Active Products", value: "12", icon: "🍲", change: "3 low stock" },
      { label: "Revenue Today", value: "₱2,450", icon: "💰", change: "+18% vs avg" },
    ];

    const recentOrders = [
      { id: "ORD-1042", customer: "Maria Santos", items: "Adobo Meal x2", total: "₱240", status: "Pending", time: "12 min ago" },
      { id: "ORD-1041", customer: "Juan Dela Cruz", items: "Puto Bumbong x1", total: "₱80", status: "Preparing", time: "34 min ago" },
      { id: "ORD-1040", customer: "Ana Reyes", items: "Leche Flan x3", total: "₱270", status: "Ready", time: "1 hr ago" },
      { id: "ORD-1039", customer: "Carlos Lim", items: "Longganisa Pack", total: "₱150", status: "Completed", time: "2 hrs ago" },
    ];

    const statusClass = (s) => {
      const map = { Pending: "status-pending", Preparing: "status-preparing", Ready: "status-ready", Completed: "status-completed" };
      return map[s] || "";
    };

    return (
      <section className="seller-dashboard">
        {/* Header */}
        <div className="seller-dash-header">
          <div>
            <h1 className="seller-dash-title">Kumusta, {user?.name || "Seller"}!</h1>
            <p className="seller-dash-subtitle">Manage your home kitchen storefront · Agoo, La Union</p>
          </div>
          <div className="seller-dash-actions">
            <Link to="/my-products" className="auth-submit-btn">+ Add Product</Link>
            <Link to="/orders" className="auth-submit-btn home-link-secondary">View All Orders</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <span className="stat-icon">{stat.icon}</span>
              <div>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-change">{stat.change}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two-column: Orders + Quick links */}
        <div className="seller-dash-grid">
          {/* Recent orders */}
          <div className="seller-panel">
            <div className="seller-panel-header">
              <h2>Recent Orders</h2>
              <Link to="/orders" className="panel-link">See all →</Link>
            </div>
            <div className="orders-table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="order-id">{o.id}</td>
                      <td>{o.customer}</td>
                      <td>{o.items}</td>
                      <td className="order-total">{o.total}</td>
                      <td>
                        <span className={`status-badge ${statusClass(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="order-time">{o.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar panels */}
          <div className="seller-sidebar">
            <div className="seller-panel">
              <h2>Quick Actions</h2>
              <div className="quick-action-list">
                <Link to="/my-products" className="quick-action-item">
                  <span>🍲</span> Manage Products
                </Link>
                <Link to="/orders" className="quick-action-item">
                  <span>📋</span> Incoming Orders
                </Link>
                <Link to="/chat" className="quick-action-item">
                  <span>💬</span> Messages
                </Link>
                <Link to="/analytics" className="quick-action-item">
                  <span>📊</span> Sales Analytics
                </Link>
              </div>
            </div>

            <div className="seller-panel seller-tips">
              <h2>Today’s Tips</h2>
              <ul>
                <li>2 orders are still <strong>Pending</strong> — accept them soon.</li>
                <li>3 products are low on stock. Restock before peak hours.</li>
                <li>Respond to chat within 15 min to keep your rating high.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (role === "admin") {
    return (
      <section className="home-content">
        <h1>Admin Dashboard Overview</h1>
        <h3>Keep the marketplace running smoothly</h3>
        <p>Monitor sellers, manage users, and oversee platform activity.</p>
        <div className="home-quick-links">
          <a href="/admin-dashboard" className="auth-submit-btn">Dashboard</a>
          <a href="/admin/users" className="auth-submit-btn home-link-secondary">Manage Users</a>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-section">
      <span className="live-badge">
        <span className="live-dot" /> LIVE · AGOO, LA UNION
      </span>

      <h1 className="hero-heading">
        Your neighborhood <span className="hero-accent">food market</span>, online.
      </h1>

      <p className="hero-subtext">
        Discover verified home-based food businesses across Agoo's barangays —
        ranked by proximity and what matters to you. Preorder fresh kakanin,
        ulam, pastries, and more.
      </p>

      <div className="category-pill-row">
        {categoryPills.map((pill) => (
          <button key={pill} className="category-pill" onClick={() => handlePillClick(pill)}>
            {pill}
          </button>
        ))}
      </div>

      <form className="search-filter-container hero-search" onSubmit={handleSearch}>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for pancit, kakanin, lechon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filter">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="hero-search-btn">Browse Sellers →</button>
      </form>

      <div className="hero-stats">
        <div className="hero-stat">
          <strong>120+</strong>
          <span>Active Sellers</span>
        </div>
        <div className="hero-stat">
          <strong>14</strong>
          <span>Barangays</span>
        </div>
        <div className="hero-stat">
          <strong>8K+</strong>
          <span>Orders/month</span>
        </div>
      </div>
    </section>
  );
}
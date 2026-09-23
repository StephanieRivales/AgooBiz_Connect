import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Dropdown from "../components/Dropdown";
import "../App.css";

const categoryPills = [
  "Lechon", "Pancit Malabon", "Biko", "Embutido",
  "Leche Flan", "Buko Salad", "Caldereta", "Menudo",
  "Kutsinta", "Sapin-Sapin", "Fruit Salad", "Spaghetti",
];

export default function Home() {
  const { user } = useAuth();
  const role = user?.role || "guest";
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
  "All", "Birthday", "Fiesta", "Wedding",
  "Christmas / Noche Buena", "Baptismal", "Graduation", "Wake / Lamay",
];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(category)}`);
  };

  const handlePillClick = (pill) => {
    navigate(`/shop?search=${encodeURIComponent(pill)}`);
  };

     if (role === "seller") {
    const stats = [
      { label: "Today's Orders", value: "8", icon: "📦" },
      { label: "Pending", value: "3", icon: "⏳" },
      { label: "Products", value: "12", icon: "🍲" },
      { label: "This Week Sales", value: "₱4,250", icon: "💰" },
    ];

    const recentOrders = [
      { id: "ORD-1042", buyer: "Maria S.", total: "₱320", status: "Pending" },
      { id: "ORD-1041", buyer: "Juan D.", total: "₱180", status: "Preparing" },
      { id: "ORD-1040", buyer: "Ana L.", total: "₱450", status: "Ready" },
      { id: "ORD-1039", buyer: "Carlo R.", total: "₱95", status: "Completed" },
    ];


    return (
      <section className="seller-dashboard">

        <div className="seller-dash-header">
          <div>
            <h1>Kumusta, {user?.name || "Seller"}!</h1>
            <p className="seller-dash-sub">
              Manage your kitchen storefront · {user?.barangay || "Agoo, La Union"}
            </p>
          </div>
          <a href="/my-products" className="btn-primary">+ Add Product</a>
        </div>


        <div className="stat-grid">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <span className="stat-icon">{s.icon}</span>
              <div>
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>


        <div className="seller-dash-grid">
          <div className="dash-panel">
            <div className="dash-panel-head">
              <h2>Recent Orders</h2>
              <a href="/orders">View all</a>
            </div>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Buyer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.buyer}</td>
                    <td>{o.total}</td>
                    <td>
                      <span className={`status-badge status-${o.status.toLowerCase()}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dash-panel">
            <div className="dash-panel-head">
              <h2>Quick Actions</h2>
            
            </div>
            <ul className="quick-action-list">
              <li><a href="/my-products">My Products</a></li>
              <li><a href="/orders">Manage Orders</a></li>
              <li><a href="/analytics">Demand Analytics</a></li>
              <li><a href="/chat">Messages</a></li>
            </ul>
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
        Fiesta-ready <span className="hero-accent">occasion food</span>, from Agoo's home kitchens.
      </h1>

      <p className="hero-subtext">
        Preorder lechon, pancit, kakanin, and party trays from verified home-based
        cooks across Agoo's barangays — made for birthdays, fiestas, weddings,
        and every celebration in between.
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
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for lechon, pancit, kakanin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filter">
          <Dropdown options={categories} value={category} onChange={setCategory} />
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
      <div id="how-it-works" className="how-it-works-section">
        <h2 className="how-it-works-title">How AgooBiz Connect works</h2>
        <div className="how-it-works-grid">
          <div className="how-it-works-step">
            <span className="how-it-works-number">1</span>
            <h4>Browse by occasion</h4>
            <p>Search or filter sellers by what you're celebrating — birthday, fiesta, wedding, and more.</p>
          </div>
          <div className="how-it-works-step">
            <span className="how-it-works-number">2</span>
            <h4>Preorder from home cooks</h4>
            <p>Message the seller, confirm quantity and pickup or delivery details, then place your order.</p>
          </div>
          <div className="how-it-works-step">
            <span className="how-it-works-number">3</span>
            <h4>Pick up or get delivered</h4>
            <p>Your order is prepared fresh and ready by the date you need it for your event.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
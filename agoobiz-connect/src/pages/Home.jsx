import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Dropdown from "../components/Dropdown";
import ProductCard from "../components/ProductCard";
import { productsApi } from "../api/productsApi";
import { usersApi } from "../api/usersApi";
import "../App.css";

const categoryPills = [
  "Lechon", "Pancit Malabon", "Biko", "Embutido",
  "Leche Flan", "Buko Salad", "Caldereta", "Menudo",
  "Kutsinta", "Sapin-Sapin", "Fruit Salad", "Spaghetti",
];

export default function Home() {
  const { user } = useAuth();
  const { cart } = useCart();
  const role = user?.role || "guest";
  const navigate = useNavigate();

  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    productsApi.getAll()
      .then((data) => setFeatured(Array.isArray(data) ? data.slice(0, 8) : []))
      .catch(() => {});
  }, []);

  const [adminUsers, setAdminUsers] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);

  useEffect(() => {
    if (role !== "admin") return;
    usersApi.getAll()
      .then((data) => setAdminUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
    productsApi.getAll()
      .then((data) => setAdminProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [role]);

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
          <Link to="/my-products" className="btn-primary">+ Add Product</Link>
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
              <Link to="/orders">View all</Link>
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
              <li><Link to="/my-products">My Products</Link></li>
              <li><Link to="/orders">Manage Orders</Link></li>
              <li><Link to="/analytics">Demand Analytics</Link></li>
              <li><Link to="/chat">Messages</Link></li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  if (role === "buyer") {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce(
      (sum, item) => sum + item.quantity * Number(item.product?.price ?? item.price ?? 0),
      0
    );

    return (
      <section className="seller-dashboard">
        <div className="seller-dash-header">
          <div>
            <h1>Kumusta, {user?.name || "there"}!</h1>
            <p className="seller-dash-sub">Ready to order for your next celebration?</p>
          </div>
          <Link to="/shop" className="btn-primary">Browse Occasion Food</Link>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-icon">🛒</span>
            <div>
              <p className="stat-value">{cartCount}</p>
              <p className="stat-label">Items in Cart</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">₱</span>
            <div>
              <p className="stat-value">₱{cartTotal.toFixed(2)}</p>
              <p className="stat-label">Cart Total</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📍</span>
            <div>
              <p className="stat-value">Agoo</p>
              <p className="stat-label">La Union</p>
            </div>
          </div>
        </div>

        <div className="seller-dash-grid">
          <div className="dash-panel">
            <div className="dash-panel-head">
              <h2>Shop by Occasion</h2>
            </div>
            <div className="category-pill-row">
              {categories.filter((c) => c !== "All").map((cat) => (
                <button
                  key={cat}
                  className="category-pill"
                  onClick={() => navigate(`/shop?category=${encodeURIComponent(cat)}`)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="dash-panel">
            <div className="dash-panel-head">
              <h2>Quick Actions</h2>
            </div>
            <ul className="quick-action-list">
              <li><Link to="/shop">Discover Sellers</Link></li>
              <li><Link to="/cart">View Cart{cartCount > 0 ? ` (${cartCount})` : ""}</Link></li>
              <li><Link to="/my-orders">My Orders</Link></li>
            </ul>
          </div>
        </div>

        {featured.length > 0 && (
          <div className="dash-panel" style={{ marginTop: 16 }}>
            <div className="dash-panel-head">
              <h2>Fresh from our kitchens</h2>
              <Link to="/shop">See all</Link>
            </div>
            <div className="product-grid">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  if (role === "admin") {
    const pendingSellers = adminUsers.filter(
      (u) => u.role === "seller" && u.verificationStatus === "pending"
    );
    const approvedSellers = adminUsers.filter(
      (u) => u.role === "seller" && u.verificationStatus === "approved"
    ).length;
    const buyers = adminUsers.filter((u) => u.role === "buyer").length;

    return (
      <section className="seller-dashboard">
        <div className="seller-dash-header">
          <div>
            <h1>Admin Overview</h1>
            <p className="seller-dash-sub">
              Welcome back, {user?.name || "Admin"}. Here's how AgooBiz Connect is doing today.
            </p>
          </div>
          <Link to="/admin/users" className="btn-primary">Manage Users</Link>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div>
              <p className="stat-value">{adminUsers.length}</p>
              <p className="stat-label">Total Accounts</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⏳</span>
            <div>
              <p className="stat-value">{pendingSellers.length}</p>
              <p className="stat-label">Sellers Awaiting Review</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🍲</span>
            <div>
              <p className="stat-value">{approvedSellers}</p>
              <p className="stat-label">Approved Sellers</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🛍️</span>
            <div>
              <p className="stat-value">{adminProducts.length}</p>
              <p className="stat-label">Products Listed</p>
            </div>
          </div>
        </div>

        <div className="seller-dash-grid">
          <div className="dash-panel">
            <div className="dash-panel-head">
              <h2>Needs your review</h2>
              <Link to="/admin/users">Open Manage Users</Link>
            </div>
            {pendingSellers.length === 0 ? (
              <p className="empty-state chat-empty-small">
                All caught up. No sellers are waiting for verification.
              </p>
            ) : (
              <ul className="admin-review-list">
                {pendingSellers.slice(0, 5).map((u) => (
                  <li key={u.id}>
                    <span className="user-avatar user-avatar-seller">
                      {(u.name || "?").trim()[0]?.toUpperCase()}
                    </span>
                    <div className="admin-review-info">
                      <strong>{u.name}</strong>
                      <span>{u.barangay ? `${u.barangay}, Agoo` : u.email}</span>
                    </div>
                    <Link to="/admin/users" className="admin-review-link">Review</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="dash-panel">
            <div className="dash-panel-head">
              <h2>Quick actions</h2>
            </div>
            <ul className="quick-action-list">
              <li><Link to="/admin/users">Manage users and sellers</Link></li>
              <li><Link to="/analytics">View demand analytics</Link></li>
              <li><Link to="/admin-dashboard">Open full dashboard</Link></li>
              <li><Link to="/shop">Browse the shop as a buyer</Link></li>
            </ul>
            <p className="admin-mini-note">
              {buyers} buyer{buyers !== 1 ? "s" : ""} registered so far.
            </p>
          </div>
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

      {featured.length > 0 && (
        <div className="featured-section" style={{ marginTop: 32 }}>
          <h2 className="how-it-works-title">Fresh from our kitchens</h2>
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 16 }}>
            <Link to="/shop" className="auth-submit-btn">Browse all products</Link>
          </p>
        </div>
      )}

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
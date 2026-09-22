import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    return (
      <section className="home-content">
        <h1>Kumusta, {user?.name || "Seller"}!</h1>
        <h3>Manage your home kitchen storefront</h3>
        <p>Check your incoming orders, update your product listings, and grow your business.</p>
        <div className="home-quick-links">
          <a href="/my-products" className="auth-submit-btn">My Products</a>
          <a href="/orders" className="auth-submit-btn home-link-secondary">View Orders</a>
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
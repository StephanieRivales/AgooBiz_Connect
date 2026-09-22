import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

const stats = [
  { label: "Orders This Month", value: 8, icon: "📦" },
  { label: "Items in Cart", value: 3, icon: "🛒" },
  { label: "Favorite Sellers", value: 4, icon: "❤️" },
  { label: "Total Spent", value: "₱3,120", icon: "💰" },
];

export default function BuyerDashboard() {
  const { user } = useAuth();

  return (
    <section className="dashboard-page">
      <h2 className="shop-title">Buyer Dashboard</h2>
      <p className="auth-subtitle">Welcome back, {user?.email || "Buyer"}</p>

      <div className="stat-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <span className="stat-icon">{stat.icon}</span>
            <div>
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="home-quick-links dashboard-links">
        <Link to="/shop" className="auth-submit-btn">
          Browse Shop
        </Link>
        <Link to="/cart" className="auth-submit-btn home-link-secondary">
          View Cart
        </Link>
        <Link to="/my-orders" className="auth-submit-btn home-link-secondary">
          My Orders
        </Link>
        <Link to="/chat" className="auth-submit-btn home-link-secondary">
          Messages
        </Link>
      </div>
    </section>
  );
}
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

// TODO: replace with real data from your backend/API
const stats = [
  { label: "My Products", value: 12, icon: "🍲" },
  { label: "Orders Today", value: 5, icon: "📦" },
  { label: "Pending Orders", value: 2, icon: "⏳" },
  { label: "Revenue Today", value: "₱2,450", icon: "💰" },
];

export default function SellerDashboard() {
  const { user } = useAuth();

  return (
    <section className="dashboard-page">
      <h2 className="shop-title">Seller Dashboard</h2>
      <p className="auth-subtitle">Welcome back, {user?.email || "Seller"}</p>

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
        <Link to="/my-products" className="auth-submit-btn">
          Manage Products
        </Link>
        <Link to="/orders" className="auth-submit-btn home-link-secondary">
          View Orders
        </Link>
        <Link to="/chat" className="auth-submit-btn home-link-secondary">
          Messages
        </Link>
      </div>
    </section>
  );
}
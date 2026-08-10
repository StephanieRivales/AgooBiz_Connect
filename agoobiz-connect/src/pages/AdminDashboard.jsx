import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

// TODO: replace with real data from your backend/API
const stats = [
  { label: "Total Users", value: 128, icon: "👥" },
  { label: "Active Sellers", value: 24, icon: "🍲" },
  { label: "Orders Today", value: 37, icon: "📦" },
  { label: "Revenue Today", value: "₱18,450", icon: "💰" },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <section className="dashboard-page">
      <h2 className="shop-title">Admin Dashboard</h2>
      <p className="auth-subtitle">Welcome back, {user?.email}</p>

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
        <Link to="/admin/users" className="auth-submit-btn">
          Manage Users
        </Link>
        <Link to="/admin/settings" className="auth-submit-btn home-link-secondary">
          Platform Settings
        </Link>
      </div>
    </section>
  );
}
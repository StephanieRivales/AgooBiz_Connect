import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { reportsApi } from "../api/reportsApi";
import { usersApi } from "../api/usersApi";
import Icon from "../components/Icon";
import "../App.css";

function getLastSevenDays(sales) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const row = sales.find((entry) => String(entry.date).slice(0, 10) === key);
    return {
      key,
      label: date.toLocaleDateString("en-PH", { weekday: "short" }),
      total: Number(row?.totalSales || 0),
      count: Number(row?.orderCount || 0),
    };
  });
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [summary, users, sales] = await Promise.all([
        reportsApi.getAdminSummary(),
        usersApi.getAll(),
        reportsApi.getSales(),
      ]);
      setDashboard({
        summary,
        users: Array.isArray(users) ? users : [],
        sales: Array.isArray(sales) ? sales : [],
      });
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't load the admin overview. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const summary = dashboard?.summary;
  const recentUsers = [...(dashboard?.users || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const salesByDay = getLastSevenDays(dashboard?.sales || []);
  const maxSales = Math.max(...salesByDay.map((day) => day.total), 1);

  const metrics = summary ? [
    { label: "Total accounts", value: summary.totalUsers, icon: "users", tone: "orange" },
    { label: "Sellers", value: summary.totalSellers, icon: "store", tone: "brown" },
    { label: "Orders", value: summary.totalOrders, icon: "receipt", tone: "green" },
    { label: "Marketplace revenue", value: `₱${Number(summary.totalRevenue).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`, icon: "chart", tone: "gold" },
    { label: "Pending sellers", value: summary.pendingSellers, icon: "clock", tone: "blue", path: "/admin/users" },
    { label: "Pending reports", value: summary.pendingReports, icon: "alert", tone: "red", path: "/admin/reports" },
  ] : [];

  return (
    <main className="admin-page admin-dashboard-page">
      <header className="admin-page-header admin-dashboard-heading">
        <div>
          <span className="admin-eyebrow"><Icon name="shield" size={15} /> Platform administration</span>
          <h1>Good day, {user?.name || "Admin"}</h1>
          <p>Monitor marketplace activity and take care of the AgooBiz community.</p>
        </div>
        <button type="button" className="admin-secondary-button" onClick={loadDashboard} disabled={loading}>
          <Icon name="activity" size={17} /> {loading ? "Refreshing..." : "Refresh overview"}
        </button>
      </header>

      {error && <p className="auth-error admin-inline-error">{error}</p>}
      {loading && !dashboard ? (
        <p className="admin-loading">Loading platform overview...</p>
      ) : (
        <>
          <section className="admin-metric-grid" aria-label="Marketplace overview">
            {metrics.map((metric) => {
              const content = (
                <>
                  <span className={`admin-metric-icon tone-${metric.tone}`}><Icon name={metric.icon} size={21} /></span>
                  <span className="admin-metric-copy">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </span>
                  {metric.path && <Icon className="admin-metric-arrow" name="arrowUpRight" size={17} />}
                </>
              );
              return metric.path ? (
                <Link className="admin-metric-card" to={metric.path} key={metric.label}>{content}</Link>
              ) : (
                <article className="admin-metric-card" key={metric.label}>{content}</article>
              );
            })}
          </section>

          <section className="admin-quick-actions" aria-label="Admin tools">
            <Link to="/admin/users"><Icon name="users" size={18} /> Manage accounts</Link>
            <Link to="/admin/reports"><Icon name="alert" size={18} /> Review reports</Link>
            <Link to="/analytics"><Icon name="chart" size={18} /> Marketplace analytics</Link>
            <Link to="/settings"><Icon name="settings" size={18} /> Admin settings</Link>
          </section>

          <div className="admin-overview-grid">
            <section className="admin-panel admin-sales-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="admin-eyebrow">Last 7 days</span>
                  <h2>Marketplace sales</h2>
                </div>
                <Link to="/analytics">Full analytics <Icon name="arrowUpRight" size={15} /></Link>
              </div>
              <div className="admin-sales-chart">
                {salesByDay.map((day) => (
                  <div className="admin-sales-day" key={day.key} title={`${day.count} orders · ₱${day.total.toFixed(2)}`}>
                    <strong>{day.total > 0 ? `₱${Math.round(day.total).toLocaleString("en-PH")}` : "—"}</strong>
                    <div className="admin-sales-track">
                      <span style={{ height: `${day.total ? Math.max((day.total / maxSales) * 100, 8) : 3}%` }} />
                    </div>
                    <small>{day.label}</small>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-panel admin-attention-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="admin-eyebrow">Needs attention</span>
                  <h2>Review queue</h2>
                </div>
                <Icon name="alert" size={19} />
              </div>
              <Link to="/admin/users" className="admin-queue-link">
                <span><Icon name="clock" size={18} /> Seller applications</span>
                <strong>{summary?.pendingSellers ?? 0}</strong>
              </Link>
              <Link to="/admin/reports" className="admin-queue-link">
                <span><Icon name="alert" size={18} /> User reports</span>
                <strong>{summary?.pendingReports ?? 0}</strong>
              </Link>
              <Link to="/admin/users" className="admin-queue-link">
                <span><Icon name="shield" size={18} /> Blocked accounts</span>
                <strong>{summary?.blockedUsers ?? 0}</strong>
              </Link>
            </section>

            <section className="admin-panel">
              <div className="admin-panel-heading">
                <h2>Recently joined</h2>
                <Link to="/admin/users">Manage users <Icon name="arrowUpRight" size={15} /></Link>
              </div>
              {recentUsers.length === 0 ? (
                <p className="admin-panel-empty">No accounts to show.</p>
              ) : (
                <ul className="admin-activity-list">
                  {recentUsers.map((member) => (
                    <li key={member.id}>
                      <span className="admin-activity-icon"><Icon name={member.role === "seller" ? "store" : "user"} size={17} /></span>
                      <span className="admin-activity-copy">
                        <strong>{member.name}</strong>
                        <small>{member.email} · {member.role}</small>
                      </span>
                      <span className={`admin-member-status ${member.isBlocked || member.isActive === false ? "inactive" : ""}`}>
                        {member.isBlocked ? "Blocked" : member.isActive === false ? "Deactivated" : "Active"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
}

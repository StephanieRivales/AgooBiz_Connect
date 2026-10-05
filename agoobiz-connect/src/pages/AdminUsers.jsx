import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usersApi } from "../api/usersApi";
import "../App.css";

function initials(name) {
  return (name || "?").trim()[0]?.toUpperCase() || "?";
}

export default function AdminUsers() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingOnId, setActingOnId] = useState(null);

  const loadUsers = () => {
    setLoading(true);
    usersApi.getAll()
      .then((data) => setUsers(data || []))
      .catch(() => setError("We couldn't load the user list."))
      .finally(() => setLoading(false));
  };

  useEffect(loadUsers, []);

  const handleVerification = async (id, verificationStatus) => {
    setActingOnId(id);
    setError("");
    try {
      await usersApi.update(id, { verificationStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, verificationStatus } : u))
      );
    } catch {
      setError("We couldn't update that seller's status. Please try again.");
    } finally {
      setActingOnId(null);
    }
  };

  const handleToggleActive = async (u) => {
    const nextActive = u.isActive === false; // currently deactivated -> activate
    const verb = nextActive ? "activate" : "deactivate";
    if (!nextActive && !window.confirm(`Deactivate ${u.name}? They won't be able to log in until you activate the account again.`)) return;

    setActingOnId(u.id);
    setError("");
    try {
      await usersApi.update(u.id, { isActive: nextActive });
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, isActive: nextActive } : x))
      );
    } catch (err) {
      setError(err.response?.data?.message || `We couldn't ${verb} that account. Please try again.`);
    } finally {
      setActingOnId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this account? This can't be undone.")) return;
    setActingOnId(id);
    try {
      await usersApi.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError("We couldn't delete that account. Please try again.");
    } finally {
      setActingOnId(null);
    }
  };

  const pendingSellers = users.filter(
    (u) => u.role === "seller" && u.verificationStatus === "pending"
  );
  const everyoneElse = users.filter(
    (u) => !(u.role === "seller" && u.verificationStatus === "pending")
  );
  const approvedSellers = users.filter(
    (u) => u.role === "seller" && u.verificationStatus === "approved"
  ).length;

  if (loading) {
    return (
      <section className="seller-dashboard">
        <p className="shop-count">Loading users...</p>
      </section>
    );
  }

  return (
    <section className="seller-dashboard">
      <div className="seller-dash-header">
        <div>
          <h1>Manage Users</h1>
          <p className="seller-dash-sub">Review sellers and oversee platform accounts</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div>
            <p className="stat-value">{users.length}</p>
            <p className="stat-label">Total Accounts</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <div>
            <p className="stat-value">{pendingSellers.length}</p>
            <p className="stat-label">Pending Review</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div>
            <p className="stat-value">{approvedSellers}</p>
            <p className="stat-label">Approved Sellers</p>
          </div>
        </div>
      </div>

      {error && <p className="auth-error">{error}</p>}

      <div className="dash-panel admin-users-panel">
        <div className="dash-panel-head">
          <h2>Pending Seller Verification</h2>
        </div>

        {pendingSellers.length === 0 ? (
          <p className="empty-state chat-empty-small">No sellers waiting for review.</p>
        ) : (
          <div className="pending-seller-grid">
            {pendingSellers.map((u) => (
              <div className="pending-seller-card" key={u.id}>
                <div className="pending-seller-top">
                  <span className="user-avatar user-avatar-seller">{initials(u.name)}</span>
                  <div className="pending-seller-info">
                    <span className="pending-seller-name">{u.name}</span>
                    <span className="pending-seller-email">{u.email}</span>
                  </div>
                </div>

                <p className="pending-seller-location">
                  📍 {u.barangay}
                  {u.address ? `, ${u.address}` : ""}
                </p>

                <div className="pending-seller-docs">
                  {u.validIdUrl && (
                    <a
                      className="doc-link"
                      href={`http://localhost:5000${u.validIdUrl}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      🪪 Valid ID
                    </a>
                  )}
                  {u.proofOfAddressUrl && (
                    <a
                      className="doc-link"
                      href={`http://localhost:5000${u.proofOfAddressUrl}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📄 Proof of Address
                    </a>
                  )}
                </div>

                <div className="pending-seller-actions">
                  <button
                    type="button"
                    className="btn-approve"
                    disabled={actingOnId === u.id}
                    onClick={() => handleVerification(u.id, "approved")}
                  >
                    ✓ Approve
                  </button>
                  <button
                    type="button"
                    className="btn-reject"
                    disabled={actingOnId === u.id}
                    onClick={() => handleVerification(u.id, "rejected")}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dash-panel admin-users-panel">
        <div className="dash-panel-head">
          <h2>All Users</h2>
        </div>
        <table className="orders-table admin-users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Account</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {everyoneElse.map((u) => (
              <tr key={u.id} className={u.isActive === false ? "user-row-inactive" : ""}>
                <td>
                  <div className="user-name-cell">
                    <span className={`user-avatar user-avatar-${u.role}`}>{initials(u.name)}</span>
                    <div>
                      <div className="user-name-cell-name">{u.name}</div>
                      <div className="user-name-cell-email">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge role-badge-${u.role}`}>{u.role}</span>
                </td>
                <td>
                  {u.role === "seller" ? (
                    <span
                      className={`status-badge ${
                        u.verificationStatus === "approved"
                          ? "status-completed"
                          : u.verificationStatus === "rejected"
                          ? "status-cancelled"
                          : "status-pending"
                      }`}
                    >
                      {u.verificationStatus}
                    </span>
                  ) : (
                    <span className="admin-users-dash">—</span>
                  )}
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      u.isActive === false ? "status-cancelled" : "status-ready"
                    }`}
                  >
                    {u.isActive === false ? "Deactivated" : "Active"}
                  </span>
                </td>
                <td className="user-actions-cell">
                  {u.id !== currentAdmin?.id && (
                    <>
                      <button
                        type="button"
                        className={u.isActive === false ? "btn-text-activate" : "btn-text-deactivate"}
                        disabled={actingOnId === u.id}
                        onClick={() => handleToggleActive(u)}
                      >
                        {u.isActive === false ? "Activate" : "Deactivate"}
                      </button>
                      <button
                        type="button"
                        className="btn-text-danger"
                        disabled={actingOnId === u.id}
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
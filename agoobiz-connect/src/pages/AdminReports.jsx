import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reportsApi } from "../api/reportsApi";
import { usersApi } from "../api/usersApi";
import Icon from "../components/Icon";
import "../App.css";

const reportStatusLabel = {
  pending: "Needs review",
  reviewed: "Reviewed",
  dismissed: "Dismissed",
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [workingId, setWorkingId] = useState(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setReports(await reportsApi.getUserReports());
    } catch (err) {
      setLoadError(err.response?.data?.message || "We couldn't load user reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const updateReport = async (report, status) => {
    setWorkingId(report.id);
    setError("");
    try {
      const updated = await reportsApi.updateUserReport(report.id, { status });
      setReports((current) => current.map((item) => item.id === report.id ? { ...item, ...updated } : item));
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't update this report.");
    } finally {
      setWorkingId(null);
    }
  };

  const blockReportedAccount = async (report) => {
    const user = report.reportedUser;
    if (!user || user.isBlocked) return;
    const reason = window.prompt(
      `Enter the moderation reason for blocking ${user.name}. This will be saved to the account.`
    );
    if (reason === null) return;
    if (reason.trim().length < 10) {
      setError("Enter a moderation reason of at least 10 characters.");
      return;
    }

    setWorkingId(report.id);
    setError("");
    try {
      const updatedUser = await usersApi.update(user.id, { isBlocked: true, moderationReason: reason });
      await reportsApi.updateUserReport(report.id, {
        status: "reviewed",
        adminNote: `Account blocked: ${reason.trim()}`,
      });
      setReports((current) => current.map((item) => item.id === report.id
        ? { ...item, status: "reviewed", adminNote: `Account blocked: ${reason.trim()}`, reportedUser: { ...item.reportedUser, ...updatedUser } }
        : item
      ));
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't block the account or update the report.");
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow"><Icon name="shield" size={15} /> Trust & safety</span>
          <h1>User reports</h1>
          <p>Review reports, document outcomes, and take action on accounts violating platform rules.</p>
        </div>
        <Link to="/admin/users" className="admin-secondary-link"><Icon name="users" size={17} /> Manage accounts</Link>
      </header>

      {error && <p className="auth-error admin-inline-error">{error}</p>}
      {loading ? (
        <p className="admin-loading">Loading reports...</p>
      ) : loadError ? (
        <section className="admin-empty-state">
          <Icon name="alert" size={28} />
          <h2>Reports unavailable</h2>
          <p>{loadError}</p>
          <button type="button" className="admin-secondary-button" onClick={loadReports}>
            Try again
          </button>
        </section>
      ) : reports.length === 0 ? (
        <section className="admin-empty-state">
          <Icon name="check" size={28} />
          <h2>No reports submitted</h2>
          <p>New user reports will appear here for review.</p>
        </section>
      ) : (
        <section className="admin-report-list" aria-label="Submitted user reports">
          {reports.map((report) => (
            <article className={`admin-report-card report-${report.status}`} key={report.id}>
              <div className="admin-report-top">
                <div>
                  <span className={`admin-report-status report-status-${report.status}`}>
                    {reportStatusLabel[report.status] || report.status}
                  </span>
                  <h2>{report.reason}</h2>
                  <p className="admin-report-date">
                    Report #{report.id} · {new Date(report.createdAt).toLocaleString("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                {report.reportedUser?.isBlocked && <span className="admin-blocked-tag">Account blocked</span>}
              </div>
              <p className="admin-report-details">{report.details}</p>
              <div className="admin-report-meta">
                <span><strong>Reported account</strong>{report.reportedUser?.name || "Unavailable"} ({report.reportedUser?.role || "unknown"})</span>
                <span><strong>Submitted by</strong>{report.reporter?.name || "Unavailable"}</span>
                {report.Product && <span><strong>Related listing</strong>{report.Product.name}</span>}
              </div>
              {report.adminNote && <p className="admin-report-note"><strong>Admin note:</strong> {report.adminNote}</p>}
              {report.status === "pending" && (
                <div className="admin-report-actions">
                  {!report.reportedUser?.isBlocked && (
                    <button
                      type="button"
                      className="admin-danger-button"
                      disabled={workingId === report.id}
                      onClick={() => blockReportedAccount(report)}
                    >
                      <Icon name="alert" size={16} /> Block account
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-secondary-button"
                    disabled={workingId === report.id}
                    onClick={() => updateReport(report, "reviewed")}
                  >
                    <Icon name="check" size={16} /> Mark reviewed
                  </button>
                  <button
                    type="button"
                    className="admin-secondary-button"
                    disabled={workingId === report.id}
                    onClick={() => updateReport(report, "dismissed")}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

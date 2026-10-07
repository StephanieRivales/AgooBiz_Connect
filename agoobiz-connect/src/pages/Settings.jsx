import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usersApi } from "../api/usersApi";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";
import "../App.css";

export default function Settings() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: "", contactNumber: "", barangay: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    usersApi.getMe()
      .then((user) => setProfile({
        name: user.name || "",
        contactNumber: user.contactNumber || "",
        barangay: user.barangay || "",
      }))
      .catch((err) => setError(err.response?.data?.message || "We couldn't load your settings."))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await usersApi.updateMe(profile);
      setProfile({
        name: updated.name || "",
        contactNumber: updated.contactNumber || "",
        barangay: updated.barangay || "",
      });
      updateUser({ name: updated.name });
      setMessage("Your profile settings have been saved.");
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't save your settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="settings-page">
      <header className="settings-page-header">
        <span className="settings-kicker">Account preferences</span>
        <h1>Settings</h1>
        <p>Keep your AgooBiz Connect profile and contact information up to date.</p>
      </header>

      {loading ? (
        <p className="admin-loading">Loading settings...</p>
      ) : (
        <div className="settings-layout">
          <form className="settings-panel" onSubmit={saveProfile}>
            <div className="settings-panel-heading">
              <span className="settings-panel-icon"><Icon name="user" /></span>
              <div>
                <h2>Profile information</h2>
                <p>This information helps other members and sellers identify you.</p>
              </div>
            </div>
            <label>
              Display name
              <input
                value={profile.name}
                onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                required
              />
            </label>
            <label>
              Contact number
              <input
                type="tel"
                value={profile.contactNumber}
                onChange={(event) => setProfile({ ...profile, contactNumber: event.target.value })}
                placeholder="Your preferred contact number"
              />
            </label>
            <label>
              Barangay
              <input
                value={profile.barangay}
                onChange={(event) => setProfile({ ...profile, barangay: event.target.value })}
                placeholder="Your barangay in Agoo"
              />
            </label>
            {error && <p className="auth-error">{error}</p>}
            {message && <p className="settings-success">{message}</p>}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>

          <aside className="settings-panel settings-help-panel">
            <span className="settings-panel-icon"><Icon name="help" /></span>
            <h2>Need help?</h2>
            <p>Find answers about accounts, listings, orders, and marketplace safety.</p>
            <Link to="/faq" className="settings-help-link">Visit Help & FAQ</Link>
          </aside>
        </div>
      )}
    </main>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

const roleTabs = [
  { key: "buyer", label: "Customer" },
  { key: "seller", label: "Seller" },
  { key: "admin", label: "Admin" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!email || !password) {
      setError("Please fill in both fields.");
      setSubmitting(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      setSubmitting(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setSubmitting(false);
      return;
    }

    try {
      const loggedInUser = await login(email, password);

      // Optional: check they picked the right portal
      if (selectedRole && loggedInUser.role !== selectedRole) {
        setError(
          `This account is a ${loggedInUser.role}, not a ${selectedRole}. Please choose the correct tab.`
        );
        setSubmitting(false);
        return;
      }

      if (loggedInUser.role === "admin") {
        navigate("/admin-dashboard");
      } else if (loggedInUser.role === "seller") {
        navigate("/"); // seller home / dashboard
      } else {
        navigate("/"); // buyer home
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Log in to AgooBiz Connect</p>

        <div className="role-tabs">
          {roleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`role-tab ${selectedRole === tab.key ? "active" : ""}`}
              onClick={() => setSelectedRole(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting
              ? "Logging in..."
              : `Log In as ${roleTabs.find((t) => t.key === selectedRole)?.label}`}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </section>
  );
}
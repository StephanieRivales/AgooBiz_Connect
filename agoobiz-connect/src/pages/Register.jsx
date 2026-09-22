import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState(null); // null = not chosen yet
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [barangay, setBarangay] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
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
      const newUser = await signup({
        name,
        email,
        password,
        role,
        barangay: barangay || undefined,
      });

      if (newUser.role === "seller") {
        navigate("/");
      } else {
        navigate("/");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 1: choose role
  if (!role) {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <h2>Join AgooBiz Connect</h2>
          <p className="auth-subtitle">How would you like to register?</p>

          <div className="role-picker">
            <button type="button" className="role-btn" onClick={() => setRole("buyer")}>
              Register as Customer
            </button>
            <button type="button" className="role-btn" onClick={() => setRole("seller")}>
              Register as Seller
            </button>
          </div>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Log in here</Link>
          </p>
        </div>
      </section>
    );
  }

  // STEP 2: form
  return (
    <section className="auth-page">
      <div className="auth-card">
        <button type="button" className="back-link" onClick={() => setRole(null)}>
          ← Change role
        </button>

        <h2>{role === "seller" ? "Seller Registration" : "Customer Registration"}</h2>
        <p className="auth-subtitle">
          {role === "seller"
            ? "Set up your home-based kitchen storefront"
            : "Create your account to start ordering"}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={role === "seller" ? "Business Name" : "Full Name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          {role === "seller" && (
            <input
              type="text"
              placeholder="Barangay (optional)"
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
            />
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting
              ? "Registering..."
              : `Register as ${role === "seller" ? "Seller" : "Customer"}`}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </section>
  );
}
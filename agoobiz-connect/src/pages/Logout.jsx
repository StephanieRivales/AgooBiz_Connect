import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    const timer = setTimeout(() => {
      navigate("/");
    }, 1200);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2>You've been logged out</h2>
        <p className="auth-subtitle">Redirecting you to the homepage...</p>
      </div>
    </section>
  );
}
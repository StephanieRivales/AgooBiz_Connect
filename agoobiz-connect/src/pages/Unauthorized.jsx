import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import "../App.css";

export default function Unauthorized() {
  return (
    <main className="admin-page">
      <section className="admin-empty-state">
        <Icon name="shield" size={28} />
        <h1>Access restricted</h1>
        <p>Your account doesn't have permission to view this page.</p>
        <Link to="/" className="admin-secondary-link">Return to the marketplace</Link>
      </section>
    </main>
  );
}

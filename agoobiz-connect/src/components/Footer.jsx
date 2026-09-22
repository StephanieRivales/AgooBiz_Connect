import { Link } from "react-router-dom";
import "../App.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-brand-row">
            <div className="footer-logo-circle">A</div>
            <span className="footer-brand-name">AgooBiz Connect</span>
          </div>
          <p className="footer-tagline">
            Connecting verified home-based food businesses with hungry neighbors
            across Agoo, La Union.
          </p>
        </div>

        <div className="footer-col">
          <h4>Platform</h4>
          <Link to="/shop">Browse Sellers</Link>
          <Link to="/register">Register Your Business</Link>
          <Link to="/analytics">Demand Analytics</Link>
          <Link to="/how-it-works">Verification Program</Link>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <p>Agoo Public Market, La Union</p>
          <p>agoobiz@connect.ph</p>
          <p>+63 912 345 6789</p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 AgooBiz Connect · Agoo, La Union, Philippines</span>
        <span>Empowering local food economies</span>
      </div>
    </footer>
  );
}
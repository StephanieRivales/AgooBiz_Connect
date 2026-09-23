import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "../App.css";
import { menus, menuPaths, menuIcons } from "../pages/menuConfig";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const guestNav = [
  { label: "Discover", path: "/shop" },
  { label: "Analytics", path: "/analytics" },
  { label: "How It Works", path: "/#how-it-works" },
];

const sellerNav = [
  { label: "Dashboard", path: "/" },
  { label: "My Products", path: "/my-products" },
  { label: "Orders", path: "/orders" },
  { label: "Analytics", path: "/analytics" },
];

const buyerNav = [
  { label: "Discover", path: "/shop" },
  { label: "My Orders", path: "/my-orders" },
];

const adminNav = [
  { label: "Dashboard", path: "/admin-dashboard" },
  { label: "Users", path: "/admin/users" },
  { label: "Analytics", path: "/analytics" },
];

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();
  const { cart } = useCart();
  const role = user?.role || "guest";
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks =
    role === "seller" ? sellerNav :
    role === "buyer"  ? buyerNav  :
    role === "admin"  ? adminNav  : guestNav;

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="header">
      <Link to="/" className="brand-block">
        <div className="logo-circle">A</div>
        <div className="brand-text">
          <span className="brand-name">
            <span className="brand-agoo">AgooBiz</span>{" "}
            <span className="brand-connect">Connect</span>
          </span>
          <span className="brand-location">AGOO, LA UNION</span>
        </div>
      </Link>

      <nav className="header-nav">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`header-nav-link ${location.pathname === link.path ? "active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="header-right" ref={menuRef}>
        {role === "buyer" && (
          <Link to="/cart" className="cart-icon-link" aria-label="Cart">
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        )}

        {role === "guest" && (
          <Link to="/register" className="register-business-btn">
            Register Business
          </Link>
        )}

        {role !== "guest" && (
          <span className="header-user-chip">
            {role === "seller" ? "🍲" : role === "admin" ? "🛡️" : "🛒"}{" "}
            {user?.name || user?.email?.split("@")[0] || role}
          </span>
        )}

        <button
          className="menu-btn"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Menu"
          aria-expanded={showMenu}
        >
          <span className="menu-icon">{showMenu ? "✕" : "☰"}</span>
        </button>

        {showMenu && (
          <nav className="dropdown-menu">
            <div className="dropdown-header">
              {role === "guest" ? "Welcome" : `Signed in as ${role}`}
            </div>
            <hr className="dropdown-divider" />
            <ul>
              {(menus[role] || menus.guest).map((item) => (
                <li key={item}>
                  <Link
                    to={menuPaths[item] || "/"}
                    onClick={() => setShowMenu(false)}
                  >
                    <span className="dropdown-icon">{menuIcons[item] || "•"}</span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
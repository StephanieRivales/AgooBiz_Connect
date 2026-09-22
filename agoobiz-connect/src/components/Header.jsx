import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../App.css";
import { menus, menuPaths, menuIcons } from "../pages/menuConfig";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { label: "Discover", path: "/shop" },
  { label: "Analytics", path: "/analytics" },
  { label: "How It Works", path: "/how-it-works" },
];

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();
  const role = user?.role || "guest";
  const location = useLocation();

  return (
    <header className="header">
      <Link to="/home" className="brand-block">
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

      <div className="header-right">
        {role === "guest" && (
          <Link to="/register" className="register-business-btn">
            Register Business
          </Link>
        )}

        <button className="menu-btn" onClick={() => setShowMenu(!showMenu)} aria-label="Menu">
          <span className="menu-icon">☰</span>
        </button>

        {showMenu && (
          <nav className="dropdown-menu">
            <div className="dropdown-header">
              {role === "guest" ? "Welcome" : `Signed in as ${role}`}
            </div>
            <hr className="dropdown-divider" />
            <ul>
              {menus[role].map((item) => (
                <li key={item}>
                  <Link to={menuPaths[item] || "/"} onClick={() => setShowMenu(false)}>
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
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo.png";
import { menus } from "../pages/menuConfig";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Icon from "./Icon";

const roleQuickLinks = {
  guest: [
    { label: "Discover", path: "/shop", icon: "store" },
    { label: "How it works", path: "/#how-it-works", icon: "help" },
  ],
  buyer: [
    { label: "Discover", path: "/shop", icon: "store" },
    { label: "My orders", path: "/my-orders", icon: "receipt" },
  ],
  seller: [
    { label: "My products", path: "/my-products", icon: "package" },
    { label: "Orders", path: "/orders", icon: "receipt" },
  ],
  admin: [
    { label: "Overview", path: "/admin-dashboard", icon: "layout" },
    { label: "User reports", path: "/admin/reports", icon: "alert" },
  ],
};

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();
  const { cart } = useCart();
  const role = user?.role || "guest";
  const location = useLocation();
  const menuSections = menus[role] || menus.guest;
  const quickLinks = roleQuickLinks[role] || roleQuickLinks.guest;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setShowMenu(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="header">
      <Link to="/" className="brand-block">
        <img src={logo} alt="AgooBiz Connect logo" className="logo-img" />
        <div className="brand-text">
          <span className="brand-name">
            <span className="brand-agoo">AgooBiz</span>{" "}
            <span className="brand-connect">Connect</span>
          </span>
          <span className="brand-location">AGOO, LA UNION</span>
        </div>
      </Link>

      <nav className="header-info-nav" aria-label={`${role} quick links`}>
        {quickLinks.map((link) => (
          <Link
            to={link.path}
            key={link.path}
            className={location.pathname === link.path ? "active" : ""}
          >
            <Icon name={link.icon} size={17} />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="header-right">
        <button
          className="menu-btn"
          onClick={() => setShowMenu((isOpen) => !isOpen)}
          aria-label={showMenu ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={showMenu}
          aria-controls="header-menu-drawer"
        >
          <Icon name={showMenu ? "close" : "menu"} className="menu-icon" size={24} />
        </button>
      </div>

      {showMenu && (
        <div className="menu-drawer-layer">
          <button
            type="button"
            className="menu-drawer-backdrop"
            onClick={() => setShowMenu(false)}
            aria-label="Close navigation menu"
          />
          <nav
            id="header-menu-drawer"
            className="menu-drawer"
            aria-label="Main navigation"
          >
            <div className="menu-drawer-header">
              <div className="menu-drawer-user">
                <span className="menu-drawer-avatar" aria-hidden="true">
                  <Icon name={role === "seller" ? "store" : role === "admin" ? "shield" : "user"} size={22} />
                </span>
                <div>
                  <p className="menu-drawer-eyebrow">{role === "guest" ? "Welcome to" : `Signed in as ${role}`}</p>
                  <strong>{role === "guest" ? "AgooBiz Connect" : user?.name || user?.email?.split("@")[0] || role}</strong>
                </div>
              </div>
              <button
                type="button"
                className="menu-drawer-close"
                onClick={() => setShowMenu(false)}
                aria-label="Close navigation menu"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {menuSections.map((section) => (
              <section className="menu-drawer-section" key={section.title}>
                <h2>{section.title}</h2>
                <ul>
                  {section.items.map((item) => {
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`${item.danger ? "menu-drawer-link danger" : "menu-drawer-link"}${location.pathname === item.path ? " active" : ""}`}
                          onClick={() => setShowMenu(false)}
                          aria-current={location.pathname === item.path ? "page" : undefined}
                        >
                          <Icon name={item.icon} className="menu-drawer-icon" />
                          <span>{item.label}</span>
                          {item.showCartCount && cartCount > 0 && (
                            <span className="menu-drawer-badge">{cartCount}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            <nav className="menu-drawer-info-links" aria-label="About AgooBiz Connect">
              <Link to="/#how-it-works" onClick={() => setShowMenu(false)}>How it works</Link>
              <Link to="/#about" onClick={() => setShowMenu(false)}>About</Link>
              <Link to="/#contact" onClick={() => setShowMenu(false)}>Contact</Link>
            </nav>
            <p className="menu-drawer-footer">Supporting local business in Agoo, La Union</p>
          </nav>
        </div>
      )}
    </header>
  );
}
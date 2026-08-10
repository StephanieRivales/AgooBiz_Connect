import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { menus, menuPaths, menuIcons } from "../pages/menuConfig";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();
  const role = user?.role || "guest";

  return (
    <header className="header">
      <div className="header-left">
        <img src="/logo.png" alt="App Logo" className="logo" />
        <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
          <span className="menu-icon">☰</span>
        </button>
      </div>

      <h1 className="app-title">AgooBiz Connect</h1>

      <div className="header-right">
        <button className="profile-btn">
          <span className="profile-icon">👤</span>
        </button>
      </div>

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
    </header>
  );
}
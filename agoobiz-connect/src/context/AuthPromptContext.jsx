import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const AuthPromptContext = createContext(null);

export function AuthPromptProvider({ children }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const requireAuth = (action) => {
    if (user) {
      action();
    } else {
      setOpen(true);
    }
  };

  const close = () => setOpen(false);

  const goTo = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <AuthPromptContext.Provider value={{ requireAuth }}>
      {children}
      {open && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={close} aria-label="Close">✕</button>
            <span className="modal-icon">🔒</span>
            <h3>Login required</h3>
            <p>Create a free account or log in so you can order occasion food from AgooBiz Connect sellers.</p>
            <div className="modal-actions">
              <button className="auth-submit-btn" onClick={() => goTo("/login")}>Log In</button>
              <button className="modal-secondary-btn" onClick={() => goTo("/register")}>Register</button>
            </div>
          </div>
        </div>
      )}
    </AuthPromptContext.Provider>
  );
}

export const useAuthPrompt = () => useContext(AuthPromptContext);
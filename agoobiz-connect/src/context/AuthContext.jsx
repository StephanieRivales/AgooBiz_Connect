import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password, selectedRole) => {
  let role = "buyer"; // default role for unlimited users

  if (email === "admin@123.com" && password === "admin123") {
    role = "admin";
  } else if (email.endsWith("@seller.com")) {
    role = "seller";
  }

  // Validate the account's actual role matches the portal they picked
  if (selectedRole && role !== selectedRole) {
    throw new Error(
      `This account is registered as a ${role}, not a ${selectedRole}. Please choose the correct portal.`
    );
  }

  const userData = { email, role };
  const token = "fake-jwt-token";

  localStorage.setItem("user", JSON.stringify(userData));
  localStorage.setItem("token", token);
  setUser(userData);

  return userData;
};

  const signup = async ({ name, email, password, role }) => {
    // Prevent signup as admin unless explicitly allowed
    if (role === "admin") {
      throw new Error("Admin accounts cannot be created via signup.");
    }

    const newUser = { name, email, role };
    const token = "fake-jwt-token";

    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", token);
    setUser(newUser);

    return newUser;
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

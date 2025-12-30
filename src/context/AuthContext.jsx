import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize auth from localStorage
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : null;
  });

  // Persist auth changes
  useEffect(() => {
    if (auth) {
      localStorage.setItem("auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("auth");
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

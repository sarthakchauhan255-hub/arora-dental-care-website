import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('aurora_admin_token');
    const storedAdmin = localStorage.getItem('aurora_admin_user');
    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const loginSuccess = (tokenValue, adminData) => {
    setToken(tokenValue);
    setAdmin(adminData);
    localStorage.setItem('aurora_admin_token', tokenValue);
    localStorage.setItem('aurora_admin_user', JSON.stringify(adminData));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('aurora_admin_token');
    localStorage.removeItem('aurora_admin_user');
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, loginSuccess, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

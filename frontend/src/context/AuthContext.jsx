import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = sessionStorage.getItem('careerpilot_auth');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (auth) sessionStorage.setItem('careerpilot_auth', JSON.stringify(auth));
    else sessionStorage.removeItem('careerpilot_auth');
  }, [auth]);

  const login = (data) => setAuth(data); 
  const logout = () => setAuth(null);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

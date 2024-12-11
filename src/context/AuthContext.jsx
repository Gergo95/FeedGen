import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import {
  subscribeToAuthChanges,
  logout as serviceLogout,
} from "../service/AuthService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const listenerRegistered = useRef(false);

  useEffect(() => {
    if (listenerRegistered.current) return;

    listenerRegistered.current = true;

    const unsubscribe = subscribeToAuthChanges((userData) => {
      setCurrentUser(userData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      listenerRegistered.current = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await serviceLogout();
      setCurrentUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, loading, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

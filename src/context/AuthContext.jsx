import React, { createContext, useState, useEffect, useContext } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      return <Navigate to="/home" replace />;
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user details from Firestore
        const userRef = doc(db, "Users", user.uid);
        const userSnap = await getDoc(userRef);

        setCurrentUser({
          uid: user.uid,
          email: user.email,
          ...userSnap.data(),
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div> {/* Show the spinner */}
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

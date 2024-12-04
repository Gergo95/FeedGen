import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const listenerRegistered = useRef(false); // Track listener registration

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    if (listenerRegistered.current) return; // Avoid duplicate listener registration

    console.log("Setting up onAuthStateChanged listener");
    listenerRegistered.current = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user);

      if (!user) {
        console.log("No user logged in");
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userRef = doc(db, "Users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        console.log("Fetched user data:", userData);

        setCurrentUser({
          uid: user.uid,
          email: user.email,
          ...userData,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      console.log("Cleaning up onAuthStateChanged listener");
      unsubscribe();
      listenerRegistered.current = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

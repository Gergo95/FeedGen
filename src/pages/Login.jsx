import React, { useState } from "react";
import "../styles/components/login.css";
import { auth, googleProvider, db } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth(); // Correctly destructure loading from useAuth

  const singInWithGoogle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Check if user email is verified
      if (!user.emailVerified) {
        toast.error("Please verify your email before logging in.", {
          position: "top-center",
        });
        setLoading(false);
        return;
      }

      // Ensure user is added to Firestore
      await ensureUserInFirestore(user);

      toast.success("Logged in with Google successfully!", {
        position: "top-center",
      });
      navigate("/feed");
    } catch (err) {
      console.error(err);
      setError("Failed to login with Google.");
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login button clicked");

    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if user email is verified
      if (!user.emailVerified) {
        toast.error("Please verify your email before logging in.", {
          position: "top-center",
        });
        setLoading(false);
        return;
      }

      // Ensure user is added to Firestore
      await ensureUserInFirestore(user);

      console.log("User logged in:", user);
      toast.success("User logged in successfully!", {
        position: "top-center",
      });

      // Wait for AuthContext to resolve before navigating
      const waitForAuth = setInterval(() => {
        if (!authLoading) {
          clearInterval(waitForAuth);
          console.log("Navigating to /feed");
          navigate("/feed");
        }
      }, 100); // Check every 100ms
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.message, {
        position: "bottom-center",
      });
      setError("Failed to login. Please check your email and password.");
    }

    setLoading(false);
  };

  // Ensure the user is added to Firestore
  const ensureUserInFirestore = async (user) => {
    try {
      const userRef = doc(db, "Users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "Anonymous",
          photoURL: user.photoURL || "/default-avatar.png",
          createdAt: new Date(),
        });
        console.log("User added to Firestore:", user.uid);
      }
    } catch (err) {
      console.error("Error adding user to Firestore:", err);
      throw err;
    }
  };

  return (
    <div className="login-container">
      <div className="login-page">
        <div className="login-card">
          <h1>Log In </h1>
          {error && <p className="error-message">{error}</p>}

          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="login-button" disabled={loading}>
              Log In
            </button>
          </form>
          <div className="divider">
            <span>OR</span>
          </div>
          <button className="google-login-button" onClick={singInWithGoogle}>
            <img
              src="https://firebasestorage.googleapis.com/v0/b/feedgen-cd500.firebasestorage.app/o/google-logo.png?alt=media&token=4487c36d-2dc3-4682-8f04-1a1d26f249ff"
              alt="Google Icon"
            />
            Log In with Google
          </button>

          <div className="switch-form">
            <p>
              Don't have an account? <NavLink to="/signup"> Sign up! </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

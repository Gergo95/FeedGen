import React, { useState } from "react";
import "../styles/components/login.css";
import { auth, googleProvider } from "../firebase/firebaseConfig";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createContext } from "react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const singInWithGoogle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/user/" + auth.currentUser.uid); // Redirect to the feed page after successful login
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful : " + currentUser.uid);
      navigate("/feed"); // Redirect to the feed page after successful login
    } catch (err) {
      setError("Failed to login. Please check your email and password.");
    }

    setLoading(false);
  };

  //we can use this for the current user
  //console.log(auth?.currentUser?.email);
  //with google login we can access photo -> auth.currentUser.photoURL

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
            <img src="img/google-logo.png" alt="Google Icon" />
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

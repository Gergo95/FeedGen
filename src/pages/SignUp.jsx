import React, { useState } from "react";
import "../styles/components/signUp.css";
import { auth, db, storage } from "../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const signUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;

      //Send Email Verification
      await sendEmailVerification(user);
      toast.info("Email verification link sent. Please verify your email.", {
        position: "top-center",
      });
      navigate("/home");

      //Upload profile picture to Firebase Storage
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, profilePicture);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Upload failed:", error);
          setError(error.message);
          setLoading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          //Update user profile with Firebase Auth
          await updateProfile(user, {
            displayName: `${firstName} ${lastName}`,
            photoURL: downloadURL,
          });

          //Reload the user to ensure the updated profile is available
          await reload(user);
          console.log("User Registered Successfully!!");
          toast.success(
            "Account created! Please verify your email before logging in.",
            { position: "top-center" }
          );

          setLoading(false);
          navigate("/home");
        }
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error(err.message, {
        position: "bottom-center",
      });
      setLoading(false);
    }
  };

  return (
    <div className="sign-up-page">
      <div className="auth-page">
        <div className="auth-card">
          <h1>Welcome to FeedGen</h1>
          <p className="auth-message">Join FeedGen or sign in to continue.</p>
          <form className="auth-form">
            <input
              type="text"
              placeholder="First Name"
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              onChange={(e) => setLastName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files[0])}
              required
            />
            <button type="submit" className="auth-button" onClick={signUp}>
              Sign Up
            </button>
            <div className="switch-form">
              <p>
                Already have an account? <NavLink to="/home">Log in</NavLink>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;

import React, { useState } from "react";
import "../styles/components/signUp.css";
import { auth, db, storage } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createContext } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setfirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  //async, because working with firebase a lot of things return promises
  //whenever there is an async, we need the try catch
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
      // Upload profile picture to Firebase Storage
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, profilePicture);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Optional: Handle upload progress if needed
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          // Handle errors during the upload process
          console.error("Upload failed:", error);
          setError(error.message); // Display error to the user if needed
          setLoading(false); // Stop loading spinner
        },

        async () => {
          // Get the download URL after upload
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Update user profile with Firebase Auth
          await updateProfile(user, {
            photoURL: downloadURL,
          });
          await setDoc(doc(db, "Users", user.uid), {
            //Users is the collection name is firestore we createing with this
            uid: user.uid,
            email: user.email,
            fname: firstName,
            lname: lastName,
            name: firstName + " " + lastName,
            photoURL: downloadURL,
            createdAt: new Date(),
          });
          console.log("User Registered Successfully!!");
          toast.success("User Registered Successfully!!", {
            position: "top-center",
          });
          setLoading(false);
          navigate("/login");
        }
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message, {
        position: "bottom-center",
      });
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
              onChange={(e) => setfirstName(e.target.value)}
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
                Already have an account? <NavLink to="/login">Log in</NavLink>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default SignUp;

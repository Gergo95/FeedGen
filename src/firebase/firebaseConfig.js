// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "feedgen-cd500.firebaseapp.com",
  projectId: "feedgen-cd500",
  storageBucket: "feedgen-cd500.firebasestorage.app",
  messagingSenderId: "134236169989",
  appId: "1:134236169989:web:3cecf09b028bea9c51796c",
  measurementId: "G-22FFL39TZE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app); //user info

export const auth = getAuth(app); //auth
export const storage = getStorage(); //file upload
export const googleProvider = new GoogleAuthProvider();

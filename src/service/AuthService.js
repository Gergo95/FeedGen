import { auth, db } from "../firebase/firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

/*
 Set up a subscription to auth state changes and returns an unsubscribe function.
 callback - A function to call with the user data whenever it changes.
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }

    try {
      const userRef = doc(db, "Users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      callback({ uid: user.uid, email: user.email, ...userData });
    } catch (error) {
      console.error("Error fetching user data:", error);
      callback({ uid: user.uid, email: user.email });
    }
  });
};

//Logs out the currently authenticated user.
export const logout = async () => {
  await signOut(auth);
};

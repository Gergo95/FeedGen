import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";
export const searchDatabase = async (searchTerm) => {
  try {
    const usersRef = collection(db, "Users"); // Adjust the collection name
    const postsRef = collection(db, "Posts"); // If searching across multiple collections
    const groupsRef = collection(db, "Groups"); // If searching across multiple collections

    const results = [];

    if (searchTerm) {
      // Query Users
      const userQuery = query(
        usersRef,
        where("fullname", ">=", searchTerm),
        where("fullname", "<=", searchTerm + "\uf8ff")
      );
      const userSnapshot = await getDocs(userQuery);
      userSnapshot.forEach((doc) => {
        results.push({ id: doc.id, type: "User", ...doc.data() });
      });

      // Query Posts (Optional: Expand this for other collections)
      const postQuery = query(
        postsRef,
        where("postContent", ">=", searchTerm),
        where("postContent", "<=", searchTerm + "\uf8ff")
      );
      const postSnapshot = await getDocs(postQuery);
      postSnapshot.forEach((doc) => {
        results.push({ id: doc.id, type: "Post", ...doc.data() });
      });

      const groupQuery = query(
        groupsRef,
        where("name", ">=", searchTerm),
        where("name", "<=", searchTerm + "\uf8ff")
      );
      const groupSnapshot = await getDocs(groupQuery);
      groupSnapshot.forEach((doc) => {
        results.push({ id: doc.id, type: "Group", ...doc.data() });
      });
    }

    return results;
  } catch (error) {
    console.error("Error searching database:", error);
    return [];
  }
};

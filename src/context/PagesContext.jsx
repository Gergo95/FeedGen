import React, { createContext, useContext, useCallback, useState } from "react";
import { db, storage } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const PageContext = createContext();

export const usePages = () => useContext(PageContext);

const PageProvider = ({ children }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const createPage = async (pageData) => {
    try {
      const pageRef = collection(db, "Pages");
      const docRef = await addDoc(pageRef, pageData);
      console.log("Page created with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error creating page:", error);
      throw error;
    }
  };

  const fetchPagesYouFollow = async (userId) => {
    try {
      const pageRef = collection(db, "Pages");
      //  check if the userId is in the followersId array
      const q = query(pageRef, where("followersId", "array-contains", userId));
      const querySnapshot = await getDocs(q);

      const pages = [];
      querySnapshot.forEach((doc) => {
        pages.push({ id: doc.id, ...doc.data() });
      });

      return pages;
    } catch (error) {
      console.error("Error fetching pages:", error);
      throw error;
    }
  };

  const fetchPagesByUser = async (userId) => {
    try {
      const pageRef = collection(db, "Pages");
      const q = query(pageRef, where("creatorId", "==", userId));
      const querySnapshot = await getDocs(q);
      const pages = [];
      querySnapshot.forEach((doc) => {
        pages.push({ id: doc.id, ...doc.data() });
      });
      return pages;
    } catch (error) {
      console.error("Error fetching pages:", error);
      throw error;
    }
  };

  //Fetch Them to display the concrete Group in GroupProfile.
  const fetchPageByPageId = useCallback(async (pageId) => {
    setLoading(true);
    setError(null);
    try {
      const pageRef = doc(db, "Pages", pageId);
      const pageDoc = await getDoc(pageRef);
      if (pageDoc.exists()) {
        setPages(pageDoc.data());
      } else {
        setError("Group not found");
      }
    } catch (err) {
      console.error("Error fetching page:", err);
      setError("Error fetching page");
    } finally {
      setLoading(false);
    }
  }, []);

  //Follow Page
  const followPage = async (pageId, userId, followers) => {
    if (!userId || !pageId) {
      console.lerror("page ID or User ID is missing!");
      return;
    }

    try {
      const pageRef = doc(db, "Pages", pageId);
      await updateDoc(pageRef, {
        followersId: arrayUnion(userId),
        followers: followers + 1,
      });
      console.log("User added to the Page successfully!");
    } catch (error) {
      console.log("Error adding user to Page!", error);
    }
  };

  // Update event data
  const updatePageData = async (pageId, updatedData) => {
    try {
      const pageRef = doc(db, "Pages", pageId);
      await updateDoc(pageRef, updatedData);
    } catch (error) {
      console.error("Error updating page data:", error);
      throw error;
    }
  };

  // Upload event image and get download URL
  const uploadPageImage = async (pageId, file) => {
    try {
      const storageRef = ref(storage, `pages/${pageId}/photo`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading page image:", error);
      throw error;
    }
  };

  const unfollowPage = async (pageId, userId, followers) => {
    if (!pageId || !userId) {
      console.log("Page ID or User ID is missing.");
    }

    try {
      const pageRef = doc(db, "Pages", pageId);
      const pageSnap = await getDoc(pageRef);

      if (!pageSnap.exists()) {
        console.log("Page does not exist.");
      }

      const pageData = pageSnap.data();

      // Remove user ID from the memberId array
      const updatedFollowersId = pageData.followersId.filter(
        (id) => id !== userId
      );

      // Update the group document
      await updateDoc(pageRef, {
        followersId: updatedFollowersId,
        followers: updatedFollowersId.length,
      });

      console.log("User successfully unfollowed the page.");
    } catch (error) {
      console.error("Error unfollowing page:", error);
    }
  };

  return (
    <PageContext.Provider
      value={{
        pages,
        createPage,
        fetchPagesByUser,
        fetchPageByPageId,
        followPage,
        unfollowPage,
        fetchPagesYouFollow,
        uploadPageImage,
        updatePageData,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export default PageProvider;

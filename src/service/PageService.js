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

export const createPage = async (pageData) => {
  const pageRef = collection(db, "Pages");
  const docRef = await addDoc(pageRef, pageData);
  console.log("Page created with ID:", docRef.id);
  return docRef.id;
};

export const fetchPagesYouFollow = async (userId) => {
  const pageRef = collection(db, "Pages");
  const q = query(pageRef, where("followersId", "array-contains", userId));
  const querySnapshot = await getDocs(q);

  const pages = [];
  querySnapshot.forEach((docSnap) => {
    pages.push({ id: docSnap.id, ...docSnap.data() });
  });

  return pages;
};

export const fetchPagesByUser = async (userId) => {
  const pageRef = collection(db, "Pages");
  const q = query(pageRef, where("creatorId", "==", userId));
  const querySnapshot = await getDocs(q);

  const pages = [];
  querySnapshot.forEach((docSnap) => {
    pages.push({ id: docSnap.id, ...docSnap.data() });
  });
  return pages;
};

export const fetchPageByPageId = async (pageId) => {
  const pageRef = doc(db, "Pages", pageId);
  const pageDoc = await getDoc(pageRef);
  if (pageDoc.exists()) {
    return { id: pageDoc.id, ...pageDoc.data() };
  } else {
    throw new Error("Page not found");
  }
};

export const followPage = async (pageId, userId, followers) => {
  if (!userId || !pageId) {
    throw new Error("Page ID or User ID is missing!");
  }

  const pageRef = doc(db, "Pages", pageId);
  await updateDoc(pageRef, {
    followersId: arrayUnion(userId),
    followers: followers + 1,
  });
  console.log("User added to the Page successfully!");
};

export const updatePageData = async (pageId, updatedData) => {
  const pageRef = doc(db, "Pages", pageId);
  await updateDoc(pageRef, updatedData);
};

export const uploadPageImage = async (pageId, file) => {
  const storageRef = ref(storage, `pages/${pageId}/photo`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const unfollowPage = async (pageId, userId) => {
  if (!pageId || !userId) {
    throw new Error("Page ID or User ID is missing.");
  }

  const pageRef = doc(db, "Pages", pageId);
  const pageSnap = await getDoc(pageRef);

  if (!pageSnap.exists()) {
    throw new Error("Page does not exist.");
  }

  const pageData = pageSnap.data();

  const updatedFollowersId = pageData.followersId.filter((id) => id !== userId);

  await updateDoc(pageRef, {
    followersId: updatedFollowersId,
    followers: updatedFollowersId.length,
  });

  console.log("User successfully unfollowed the page.");
};

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usePages } from "../../context/PagesContext";
import { storage } from "../../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../../styles/components/PageCreator.css";

const PageCreator = () => {
  const { currentUser } = useAuth();
  const { createPage } = usePages();
  const [pageName, setPageName] = useState("");
  const [about, setAbout] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return null;

    const storageRef = ref(storage, `pageProfiles/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pageName || !about) {
      alert("Page name and About section are required.");
      return;
    }

    setLoading(true);

    try {
      const profilePicUrl = profilePicture
        ? await handleFileUpload(profilePicture)
        : null;

      const pageData = {
        name: pageName,
        about,
        photoURL: profilePicUrl,
        creatorId: currentUser.uid,
        createdAt: new Date().toISOString(),
        followersId: [currentUser.uid],
        followers: [currentUser.uid].length,
      };

      await createPage(pageData);
      alert("Page created successfully!");
      setPageName("");
      setAbout("");
      setProfilePicture(null);
    } catch (error) {
      console.error("Error creating page:", error);
      alert("Failed to create page. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="page-creator">
      <h2>Create a Page</h2>
      <form onSubmit={handleSubmit} className="page-form">
        <label>
          Page Name:
          <input
            type="text"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            required
          />
        </label>
        <label>
          About:
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            required
          ></textarea>
        </label>
        <label>
          Profile Picture:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePicture(e.target.files[0])}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Page"}
        </button>
      </form>
    </div>
  );
};

export default PageCreator;

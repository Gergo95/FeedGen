import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usePages } from "../../context/PagesContext";
import { storage } from "../../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../../styles/components/Creator.css";
import { toast } from "react-toastify";

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

      await createPage({
        name: pageName,
        about,
        photoURL: profilePicUrl,
        creatorId: currentUser.uid,
        createdAt: new Date().toISOString(),
        followersId: [currentUser.uid],
        followers: [currentUser.uid].length,
      });

      toast.success("Page created Successfully!!", {
        position: "top-center",
      });
      setPageName("");
      setAbout("");
      setProfilePicture(null);
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-center",
      });
    }

    setLoading(false);
  };

  return (
    <div className="creator-container">
      <h2>Create a Page</h2>
      <form className="creator-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          placeholder="Page Name"
          required
        />
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="About this page"
          required
        ></textarea>
        <input
          type="file"
          onChange={(e) => setProfilePicture(e.target.files[0])}
          accept="image/*"
        />
        <button type="submit" className="creator-button" disabled={loading}>
          {loading ? "Creating..." : "Create Page"}
        </button>
      </form>
    </div>
  );
};

export default PageCreator;

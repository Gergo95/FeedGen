import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGroups } from "../../context/GroupContext";
import "../../styles/components/Creator.css";
import { toast } from "react-toastify";
import { storage } from "../../firebase/firebaseConfig";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const GroupCreator = () => {
  const { createGroup } = useGroups();
  const { currentUser } = useAuth();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return null;

    const storageRef = ref(storage, `groupProfiles/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    console.log("Current User:", currentUser);

    e.preventDefault();
    if (!groupName || !description) {
      toast.error("Group name and description are required.", {
        position: "top-center",
      });
      return;
    }

    if (!currentUser || !currentUser.uid) {
      toast.error("User not authenticated. Please log in.", {
        position: "top-center",
      });
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const profilePicUrl = profilePicture
        ? await handleFileUpload(profilePicture)
        : null;

      await createGroup({
        name: groupName,
        description,
        photoURL: profilePicUrl || null,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        memberId: [uid], //Initialize membersId with the current user
        members: 1, //originally there is only one member, the one who created it
      });

      toast.success("Group created successfully!", {
        position: "top-center",
      });
      setGroupName("");
      setDescription("");
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
      <h2>Create a Group</h2>
      <form className="creator-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group Name"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Group Description"
          required
        ></textarea>
        <input
          type="file"
          onChange={(e) => setProfilePicture(e.target.files[0])}
          accept="image/*"
        />
        <button type="submit" className="creator-button" disabled={loading}>
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
};

export default GroupCreator;

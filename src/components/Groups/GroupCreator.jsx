import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGroups } from "../../context/GroupContext";
import "../../styles/components/GroupsCreator.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const GroupCreator = () => {
  const { createGroup } = useGroups();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
  });
  const [groupImage, setGroupImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroupData({ ...groupData, [name]: value });
  };

  const handleImageChange = (e) => {
    setGroupImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createGroup(groupData, groupImage, currentUser.uid);
      setGroupData({ name: "", description: "" });
      setGroupImage(null);
      toast.success("Group Created Successfully!!", {
        position: "top-center",
      });
      navigate("/feed");
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group-creator-container">
      <h2>Create a New Group</h2>
      <form onSubmit={handleSubmit} className="group-creator-form">
        <input
          type="text"
          name="name"
          value={groupData.name}
          onChange={handleChange}
          placeholder="Group Name"
          required
          className="group-input"
        />
        <textarea
          name="description"
          value={groupData.description}
          onChange={handleChange}
          placeholder="Group Description"
          required
          className="group-textarea"
        ></textarea>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="group-file-input"
        />
        <button
          type="submit"
          className="group-submit-button"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
};

export default GroupCreator;

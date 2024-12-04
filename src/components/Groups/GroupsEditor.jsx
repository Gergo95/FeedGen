import React, { useState, useEffect, useCallback } from "react";
import "../../styles/components/GroupsEditor.css";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { useGroups } from "../../context/GroupContext";
const GroupsEditor = () => {
  const navigate = useNavigate();
  const { fetchGroupByGroupId, updateGroupData, uploadGroupImage } =
    useGroups();
  const { groupId } = useParams();

  const [group, setGroup] = useState({
    name: "",
    description: "",
    photoURL: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const data = await fetchGroupByGroupId(groupId);
        setGroup(data);
      } catch (err) {
        setError("Failed to load group data");
      }
    };
    fetchGroupData();
  }, [groupId, fetchGroupByGroupId]);

  const handleInputChange = useCallback((field, value) => {
    setGroup((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleFileChange = async (group) => {
    const file = group.target.files[0];
    if (file) {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const downloadURL = await uploadGroupImage(groupId, file);
        handleInputChange("photoURL", downloadURL);

        setLoading(false);
        setSuccess("Image uploaded successfully!");
      } catch (err) {
        console.error("Upload error:", err);
        setError("Failed to upload image");
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await updateGroupData(groupId, group);
      setLoading(false);
      setSuccess("Group updated successfully!");
      navigate(`/group-profile/${groupId}`);
    } catch (err) {
      setError("Failed to update group");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="group-editor">
        <h2 className="group-editor-title">Edit Group</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="group-form">
          <div className="photo-upload">
            <img
              src={group?.photoURL || "https://via.placeholder.com/150"}
              alt="Group"
              className="group-photo"
            />
            <input
              type="file"
              className="file-input"
              onChange={handleFileChange}
              disabled={loading}
              accept="image/*"
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Group Name"
              value={group?.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <textarea
              placeholder="Group Description"
              value={group?.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="save-button">
            <button
              onClick={handleSave}
              className="btn-save"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupsEditor;

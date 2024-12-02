import React from "react";
import { useState, useEffect } from "react";
import "../../styles/components/UserProfileEditor.css";
import UserProfileProvider, {
  useUserProf,
} from "../../context/UserProfileContext";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import TransgenderIcon from "@mui/icons-material/Transgender";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const GenderToggle = ({ gender, onChange }) => {
  const handleGenderChange = (event, newGender) => {
    if (newGender !== null) {
      onChange(newGender);
    }
  };

  return (
    <div style={{ margin: "20px 0" }}>
      <label
        style={{
          fontSize: "1rem",
          fontWeight: "bold",
          marginBottom: "10px",
          display: "block",
        }}
      >
        Gender
      </label>
      <ToggleButtonGroup
        value={gender}
        exclusive
        onChange={handleGenderChange}
        aria-label="Gender"
        style={{
          display: "flex",
          justifyContent: "space-around",
          width: "100%",
        }}
      >
        <ToggleButton
          value="man"
          aria-label="Man"
          sx={{ flexGrow: 1, padding: "10px" }}
        >
          <MaleIcon sx={{ marginRight: "5px" }} />
          Man
        </ToggleButton>
        <ToggleButton
          value="woman"
          aria-label="Woman"
          sx={{ flexGrow: 1, padding: "10px" }}
        >
          <FemaleIcon sx={{ marginRight: "5px" }} />
          Woman
        </ToggleButton>
        <ToggleButton
          value="other"
          aria-label="Other"
          sx={{ flexGrow: 1, padding: "10px" }}
        >
          <TransgenderIcon sx={{ marginRight: "5px" }} />
          Other
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

function UserProfileEditor({ userId }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    fname: "",
    lname: "",
    photoURL: "",
    about: "",
    dob: "",
    job: "",
    school: "",
    relationshipStatus: "",
    gender: "man", // Default gender
  });

  const { getUserData, uploadProfileImage, updateUserData } = useUserProf();
  const { uid } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData(uid);
        setProfile(data);
      } catch (err) {
        setError("Failed to load user data");
      }
    };
    fetchUserData();
  }, [uid]);

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      try {
        // Upload the new profile picture
        await uploadProfileImage(userId, file);
        handleInputChange("photoURL", URL.createObjectURL(file));
        setLoading(false);
      } catch (err) {
        setError("Failed to upload image");
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserData(uid, profile);
      setLoading(false);
      alert("Profile updated successfully!");
      navigate(`/user/${currentUser.uid}`);
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-editor">
        <h2 className="profile-editor-title">Edit Profile</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="profile-form">
          <div className="photo-upload">
            <img
              src={profile.photoURL || "https://via.placeholder.com/150"}
              alt="Profile"
              className="profile-avatar"
            />
            <input
              type="file"
              className="file-input"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="First Name"
              value={profile.fname}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Last Name"
              value={profile.lname}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <textarea
              placeholder="About You"
              value={profile.about}
              onChange={(e) => handleInputChange("about", e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="date"
              placeholder="Date of Birth"
              value={profile.dob}
              onChange={(e) => handleInputChange("dob", e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Job"
              value={profile.job}
              onChange={(e) => handleInputChange("job", e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="School"
              value={profile.school}
              onChange={(e) => handleInputChange("school", e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Relationship Status"
              value={profile.relationshipStatus}
              onChange={(e) =>
                handleInputChange("relationshipStatus", e.target.value)
              }
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="gender-section">
            <label></label>
            <GenderToggle
              gender={profile.gender}
              onChange={(gender) => handleInputChange("gender", gender)}
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
}

export default UserProfileEditor;

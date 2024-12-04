import React, { useState, useEffect, useCallback } from "react";
import "../../styles/components/PagesEditor.css";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { usePages } from "../../context/PagesContext";
const PagesEditor = () => {
  const navigate = useNavigate();
  const { fetchPageByPageId, updatePageData, uploadPageImage } = usePages();
  const { pageId } = useParams();

  const [page, setPage] = useState({
    name: "",
    about: "",
    photoURL: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const data = await fetchPageByPageId(pageId);
        setPage(data);
      } catch (err) {
        setError("Failed to load event data");
      }
    };
    fetchPageData();
  }, [pageId, fetchPageByPageId]);

  const handleInputChange = useCallback((field, value) => {
    setPage((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleFileChange = async (page) => {
    const file = page.target.files[0];
    if (file) {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const downloadURL = await uploadPageImage(pageId, file);
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
      await updatePageData(pageId, page);
      setLoading(false);
      setSuccess("page updated successfully!");
      navigate(`/pages/${pageId}`);
    } catch (err) {
      setError("Failed to update page");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-editor">
        <h2 className="page-editor-title">Edit Page</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="page-form">
          <div className="photo-upload">
            <img
              src={page?.photoURL || "https://via.placeholder.com/150"}
              alt="page"
              className="page-photo"
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
              placeholder="Page Name"
              value={page?.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <textarea
              placeholder="Page Description"
              value={page?.about}
              onChange={(e) => handleInputChange("about", e.target.value)}
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

export default PagesEditor;

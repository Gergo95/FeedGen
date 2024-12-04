// PostCreator.jsx

import React, { useState } from "react";
import "../../styles/components/PostCreator.css";
import { usePosts } from "../../context/PostContext";
import { useAuth } from "../../context/AuthContext";

const PostCreator = ({ contextType, contextId }) => {
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState(null);
  const { createPost } = usePosts(); // Destructure createPost from usePosts
  const { currentUser } = useAuth();

  const handlePostContentChange = (e) => {
    setPostContent(e.target.value);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setPostImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!postContent.trim() && !postImage) {
      alert("Post content or image is required!");
      return;
    }

    const postData = {
      postContent,
      contextType: contextType || null,
      contextId: contextId || null,
    };

    try {
      await createPost(postData, postImage, currentUser);
      // Clear the form
      setPostContent("");
      setPostImage(null);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  return (
    <div className="post-creator">
      <form onSubmit={handleSubmit}>
        <textarea
          className="post-input"
          placeholder={
            contextType
              ? `Share something in this ${contextType.toLowerCase()}...`
              : "What's on your mind?"
          }
          value={postContent}
          onChange={handlePostContentChange}
        />

        <div className="post-actions">
          <label htmlFor="image-upload" className="image-upload-label">
            Add Image
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
          <button type="submit" className="post-submit-button">
            Post
          </button>
        </div>

        {postImage && (
          <div className="post-preview">
            <p>Image Preview:</p>
            <img
              src={URL.createObjectURL(postImage)}
              alt="Preview"
              className="image-preview"
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default PostCreator;

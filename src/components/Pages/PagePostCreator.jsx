import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { storage, db } from "../../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import "../../styles/components/PagePostCreator.css";
import { useParams } from "react-router-dom";

const PagePostCreator = () => {
  const { currentUser } = useAuth();
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { pageId } = useParams();

  const categories = [
    "Politics",
    "Business",
    "Health",
    "Entertainment",
    "Sports",
    "Travel",
    "Science",
    "Fashion",
    "Culture",
    "Else",
  ];

  const handleImageUpload = async () => {
    if (!image) return null;
    const imageRef = ref(
      storage,
      `pagePosts/${pageId}/${Date.now()}_${image.name}`
    );
    const snapshot = await uploadBytes(imageRef, image);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const imageUrl = await handleImageUpload();
      await addDoc(collection(db, "PagePosts"), {
        pageId,
        authorId: currentUser.uid,
        category,
        content,
        imageUrl: imageUrl || null,
        likes: 0,
        createdAt: serverTimestamp(),
      });
      setCategory("");
      setContent("");
      setImage(null);
    } catch (error) {
      console.error("Error creating page post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-post-creator">
      <form className="post-form" onSubmit={handleSubmit}>
        <h2>Create a Post</h2>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a Category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something..."
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Attach Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default PagePostCreator;

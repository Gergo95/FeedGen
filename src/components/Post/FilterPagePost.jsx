import { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import "../../styles/components/FilterPagePost.css";
import AddComment from "../Comment/AddComment";
import {
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  InputLabel,
  FormControl,
  Button,
} from "@mui/material";

const FilterPagePost = () => {
  const [posts, setPosts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories] = useState([
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
  ]);

  const handleCategoryChange = (event) => {
    setSelectedCategories(event.target.value);
  };

  const fetchPosts = async (categories) => {
    try {
      const postsCollection = collection(db, "PagePosts");
      let q;

      if (categories.length > 0) {
        const categoryQueries = categories.map((category) =>
          where("category", "==", category)
        );
        q = query(
          postsCollection,
          ...categoryQueries,
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(postsCollection);
      }

      const querySnapshot = await getDocs(q);
      const postsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(postsList);
    } catch (error) {
      console.error("Error fetching posts: ", error);
    }
  };

  const handleCommentAdded = () => {
    // Refresh the comments after adding a new one
  };

  useEffect(() => {
    fetchPosts(selectedCategories);
  }, [selectedCategories]);

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel>Filter by Category</InputLabel>
        <Select
          label="Filter by Category"
          multiple
          value={selectedCategories}
          onChange={handleCategoryChange}
          renderValue={(selected) => selected.join(", ")}
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              <Checkbox checked={selectedCategories.indexOf(category) > -1} />
              <ListItemText primary={category} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className="posts-list">
        {posts.length === 0 ? (
          <p className="no-posts-message">
            No posts available in this category.
          </p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <p className="post-date">
                  {post.createdAt.toDate().toLocaleString()}
                </p>
                <p className="post-page">Page ID: {post.pageId}</p>
              </div>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-content">{post.content}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post visual"
                  className="post-image"
                />
              )}

              <div className="post-actions">
                <button className="like-button">Like</button>
                <button className="comment-button">Comment</button>
              </div>

              <AddComment postId={post.id} onAddComment={handleCommentAdded} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FilterPagePost;

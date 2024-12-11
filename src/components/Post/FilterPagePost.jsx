import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import "../../styles/components/FilterPagePost.css";
import AddComment from "../Comment/AddComment";
import { useComments } from "../../context/CommentContext";
import {
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

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
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const { fetchCommentsByPostId } = useComments();
  const navigate = useNavigate();

  const handleCategoryChange = (event) => {
    setSelectedCategories(event.target.value);
  };

  const fetchPosts = async (categories) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error("User not logged in");
        return;
      }
      //Fetch pages followed by the logged-in user
      const pagesCollection = collection(db, "Pages");
      const pagesQuery = query(
        pagesCollection,
        where("followersId", "array-contains", userId)
      );
      const pagesSnapshot = await getDocs(pagesQuery);
      const followedPageIds = pagesSnapshot.docs.map((doc) => doc.id);
      if (followedPageIds.length === 0) {
        setPosts([]);
        return;
      }
      //Fetch posts only from followed pages and apply category filter
      const postsCollection = collection(db, "PagePosts");
      let q;
      if (categories.length > 0) {
        q = query(
          postsCollection,
          where("pageId", "in", followedPageIds),
          where("category", "in", categories),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(
          postsCollection,
          where("pageId", "in", followedPageIds),
          orderBy("createdAt", "desc")
        );
      }
      const querySnapshot = await getDocs(q);
      const postsList = await Promise.all(
        querySnapshot.docs.map(async (PageDoc) => {
          const post = { id: PageDoc.id, ...PageDoc.data() };
          const postComments = await fetchCommentsByPostId(PageDoc.id);

          //Fetch the page data
          const pageDocRef = doc(db, "Pages", post.pageId);
          const pageSnapshot = await getDoc(pageDocRef);
          const pageData = pageSnapshot.exists() ? pageSnapshot.data() : null;

          return {
            ...post,
            commentsCount: postComments.length,
            page: pageData,
          };
        })
      );
      setPosts(postsList);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleToggleComments = async (postId) => {
    if (!showComments[postId]) {
      const postComments = await fetchCommentsByPostId(postId);
      setComments((prev) => ({
        ...prev,
        [postId]: postComments,
      }));
    }
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleCommentAdded = async (postId) => {
    const updatedComments = await fetchCommentsByPostId(postId);
    setComments((prev) => ({
      ...prev,
      [postId]: updatedComments,
    }));

    // Update comments count in the UI
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: updatedComments.length }
          : post
      )
    );
  };

  const handleLikePost = async (postId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return; // Ensure the user is logged in

    try {
      const postRef = doc(db, "PagePosts", postId);
      const postSnapshot = await getDoc(postRef);

      if (!postSnapshot.exists()) {
        console.error("Post not found");
        return;
      }

      const postData = postSnapshot.data();
      let likes = postData.likes;

      // Ensure likes is an array, default to empty array if missing or not an array
      if (!Array.isArray(likes)) {
        likes = [];
      }

      // Check if the user has already liked the post
      if (likes.includes(userId)) {
        // User has already liked the post, so remove the like
        await updateDoc(postRef, {
          likes: arrayRemove(userId),
        });

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: post.likes.filter((like) => like !== userId),
                }
              : post
          )
        );
      } else {
        // User hasn't liked the post yet, so add the like
        await updateDoc(postRef, {
          likes: arrayUnion(userId),
        });

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: [...post.likes, userId],
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error liking the post:", error);
    }
  };

  useEffect(() => {
    fetchPosts(selectedCategories);
  }, [selectedCategories]);

  return (
    <div className="filter-container">
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
              <Checkbox checked={selectedCategories.includes(category)} />
              <ListItemText primary={category} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className="filter-posts-list">
        {posts.length === 0 ? (
          <p className="filter-no-posts-message">
            No posts available in this category.
          </p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="filter-post-card">
              {/* Post Header with Page Info */}
              <div className="filter-post-header">
                <div className="filter-avatar-container">
                  <img
                    src={
                      post.page?.photoURL || "https://via.placeholder.com/50"
                    }
                    alt="Page Avatar"
                    className="filter-page-avatar"
                    onClick={() => navigate(`/pages/${post.pageId}`)}
                  />
                </div>
                <div className="filter-page-info">
                  <h4
                    className="filter-page-name"
                    onClick={() => navigate(`/pages/${post.pageId}`)}
                  >
                    {post.page?.name || "Unknown Page"}
                  </h4>
                  <p className="filter-post-date">
                    {post.createdAt.toDate().toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <h3 className="filter-post-title">{post.title}</h3>
              <p className="filter-post-content">{post.content}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post visual"
                  className="filter-post-image"
                />
              )}

              {/* Post Footer */}
              <div className="filter-post-footer">
                <div className="filter-likes">
                  <button
                    className="filter-like-button"
                    onClick={() => handleLikePost(post.id)}
                  >
                    ❤️ {post.likes.length}{" "}
                    {post.likes.length === 1 ? "Like" : "Likes"}
                  </button>
                </div>
                <button
                  className="filter-toggle-comments-btn"
                  onClick={() => handleToggleComments(post.id)}
                >
                  {showComments[post.id]
                    ? "Hide Comments"
                    : `View Comments (${post.commentsCount || 0})`}
                </button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="filter-comments-section">
                  {comments[post.id]?.length > 0 ? (
                    comments[post.id].map((comment) => (
                      <div key={comment.id} className="filter-comment">
                        <img
                          src={
                            comment.user?.photoURL ||
                            "https://via.placeholder.com/50"
                          }
                          alt="User Avatar"
                          className="filter-comment-user-avatar"
                        />
                        <strong className="filter-comment-user-name">
                          {comment.user?.name || "Anonymous"}:
                        </strong>
                        <div className="filter-comment-content">
                          {comment.content}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="filter-no-comments-message">
                      No comments yet.
                    </p>
                  )}
                </div>
              )}

              {/* Add Comment */}
              <AddComment
                postId={post.id}
                onAddComment={() => handleCommentAdded(post.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FilterPagePost;

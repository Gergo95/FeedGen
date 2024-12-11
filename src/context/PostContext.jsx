import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  fetchUserData as serviceFetchUserData,
  fetchFriendsPosts as serviceFetchFriendsPosts,
  fetchMyPosts as serviceFetchMyPosts,
  createPost as serviceCreatePost,
  updatePost as serviceUpdatePost,
  deletePost as serviceDeletePost,
  toggleLikePost as serviceToggleLikePost,
} from "../service/PostService";

const PostContext = createContext();

export const usePosts = () => useContext(PostContext);

const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const handleFetchUserData = async (userId) => {
    return await serviceFetchUserData(userId);
  };

  const handleFetchFriendsPosts = async (currentUserUid) => {
    setLoading(true);
    try {
      const allPosts = await serviceFetchFriendsPosts(currentUserUid);
      setPosts(allPosts);
      return allPosts;
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMyPosts = async (uid) => {
    setLoading(true);
    try {
      const userPosts = await serviceFetchMyPosts(uid);
      setMyPosts(userPosts);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (newPost, imageFile, currentUser) => {
    await serviceCreatePost(newPost, imageFile, currentUser);
  };

  const handleUpdatePost = async (postId, updatedPost) => {
    await serviceUpdatePost(postId, updatedPost);
  };

  const handleDeletePost = async (postId) => {
    await serviceDeletePost(postId);
  };

  const handleToggleLikePost = async (
    postId,
    userId,
    isLiked,
    type = "Posts"
  ) => {
    await serviceToggleLikePost(postId, userId, isLiked, type);
  };

  const value = {
    posts,
    myPosts,
    loading,
    createPost: handleCreatePost,
    updatePost: handleUpdatePost,
    deletePost: handleDeletePost,
    fetchFriendsPosts: handleFetchFriendsPosts,
    fetchMyPosts: handleFetchMyPosts,
    fetchUserData: handleFetchUserData,
    toggleLikePost: handleToggleLikePost,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};

export default PostProvider;

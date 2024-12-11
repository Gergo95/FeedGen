import React, { createContext, useContext, useCallback, useState } from "react";
import {
  createPage as serviceCreatePage,
  fetchPagesYouFollow as serviceFetchPagesYouFollow,
  fetchPagesByUser as serviceFetchPagesByUser,
  fetchPageByPageId as serviceFetchPageByPageId,
  followPage as serviceFollowPage,
  unfollowPage as serviceUnfollowPage,
  uploadPageImage as serviceUploadPageImage,
  updatePageData as serviceUpdatePageData,
} from "../service/PageService";

const PageContext = createContext();

export const usePages = () => useContext(PageContext);

const PageProvider = ({ children }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleCreatePage = async (pageData) => {
    try {
      return await serviceCreatePage(pageData);
    } catch (error) {
      console.error("Error creating page:", error);
      throw error;
    }
  };

  const handleFetchPagesYouFollow = async (userId) => {
    try {
      return await serviceFetchPagesYouFollow(userId);
    } catch (error) {
      console.error("Error fetching pages:", error);
      throw error;
    }
  };

  const handleFetchPagesByUser = async (userId) => {
    try {
      return await serviceFetchPagesByUser(userId);
    } catch (error) {
      console.error("Error fetching pages:", error);
      throw error;
    }
  };

  const handleFetchPageByPageId = useCallback(async (pageId) => {
    setLoading(true);
    setError(null);
    try {
      const pageData = await serviceFetchPageByPageId(pageId);
      setPages(pageData);
    } catch (err) {
      console.error("Error fetching page:", err);
      setError("Error fetching page");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFollowPage = async (pageId, userId, followers) => {
    try {
      await serviceFollowPage(pageId, userId, followers);
    } catch (error) {
      console.log("Error adding user to Page!", error);
    }
  };

  const handleUpdatePageData = async (pageId, updatedData) => {
    try {
      await serviceUpdatePageData(pageId, updatedData);
    } catch (error) {
      console.error("Error updating page data:", error);
      throw error;
    }
  };

  const handleUploadPageImage = async (pageId, file) => {
    try {
      return await serviceUploadPageImage(pageId, file);
    } catch (error) {
      console.error("Error uploading page image:", error);
      throw error;
    }
  };

  const handleUnfollowPage = async (pageId, userId, followers) => {
    try {
      await serviceUnfollowPage(pageId, userId);
    } catch (error) {
      console.error("Error unfollowing page:", error);
    }
  };

  const value = {
    pages,
    createPage: handleCreatePage,
    fetchPagesByUser: handleFetchPagesByUser,
    fetchPageByPageId: handleFetchPageByPageId,
    followPage: handleFollowPage,
    unfollowPage: handleUnfollowPage,
    fetchPagesYouFollow: handleFetchPagesYouFollow,
    uploadPageImage: handleUploadPageImage,
    updatePageData: handleUpdatePageData,
    loading,
    error,
  };

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

export default PageProvider;

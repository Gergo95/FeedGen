import React, { useEffect, useState } from "react";
import "../styles/components/Page.css";
import PostList from "../components/Post/PostList";
import PagePostCreator from "../components/Pages/PagePostCreator";
import Navbar from "../components/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { usePages } from "../context/PagesContext";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
function Pages() {
  const { pageId } = useParams();
  const { currentUser } = useAuth();
  const { pages, fetchPageByPageId, followPage, unfollowPage } = usePages();
  const [pageFollowers, setPageFollowers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (pageId) {
      fetchPageByPageId(pageId);
    }
  }, [pageId, fetchPageByPageId]);

  useEffect(() => {
    // Fetch followers' details
    const fetchPageFollowers = async () => {
      if (pages?.followersId?.length > 0) {
        const followersData = await Promise.all(
          pages.followersId.map(async (followerId) => {
            const userRef = doc(db, "Users", followerId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              return { id: followerId, ...userSnap.data() };
            }
            return null;
          })
        );
        setPageFollowers(followersData.filter((follower) => follower !== null));
      }
    };

    fetchPageFollowers();
  }, [pages]);

  const isFollower = (pages?.followersId || []).includes(currentUser?.uid);
  const pageCreator = pages.creatorId === currentUser?.uid;

  const handleFollowButton = async () => {
    if (!pageId || !currentUser.uid) {
      console.error("Page ID or User ID is missing.");
      return;
    }

    try {
      await followPage(pageId, currentUser.uid, pages.followers);
      alert("You have successfully followed the page!");
      await fetchPageByPageId(pageId);
    } catch (error) {
      console.error("Failed to follow page:", error);
      alert("Error: Unable to follow page.");
    }
  };

  const handleUnfollowButton = async () => {
    if (!pageId || !currentUser?.uid) {
      console.error("Page ID or User ID is missing.");
      return;
    }

    try {
      await unfollowPage(pageId, currentUser.uid);
      alert("You have successfully unfollowed the page!");
      await fetchPageByPageId(pageId);
    } catch (error) {
      console.error("Failed to unfollow page:", error);
      alert("Error: Unable to unfollow page.");
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!window.confirm("Are you sure you want to delete this page?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "Pages", pageId));
      toast.success("Page deleted successfully!", {
        position: "top-center",
      });
      navigate("/feed");
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error("Failed to delete page.", {
        position: "bottom-center",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        {/* Group Header */}
        <div className="page-header">
          <div className="page-banner">
            <img
              src={pages?.photoURL || "https://via.placeholder.com/1200x200"}
              alt="page Banner"
              className="page-avatar"
            />
          </div>
          <div className="page-info">
            <h2>{pages.name}</h2>
            {pageCreator ? (
              <>
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/edit-page-profile/${pageId}`)}
                >
                  Edit Page
                </button>
                <button
                  className="leave-btn"
                  onClick={() => handleDeletePage(pageId)}
                >
                  Delete Page
                </button>
              </>
            ) : isFollower ? (
              <button className="leave-btn" onClick={handleUnfollowButton}>
                Unfollow Page
              </button>
            ) : (
              <button className="action-btn" onClick={handleFollowButton}>
                Follow Page
              </button>
            )}
          </div>
        </div>

        {/* Group Content */}
        <div className="page-content">
          <div className="page-sidebar">
            {/* Sidebar Content */}
            <div className="about-section">
              <h3>About</h3>
              <p>{pages.about}</p>
            </div>
            <div className="stats-section">
              <div className="stat-item">
                <strong>Followers: {pages.followers}</strong>
              </div>
            </div>
            <div className="members-section">
              {pageFollowers.length > 0 ? (
                pageFollowers.map((follower) => (
                  <div key={follower.id} className="member">
                    <img
                      src={
                        follower.photoURL || "https://via.placeholder.com/50"
                      }
                      alt={follower.name || "Unknown"}
                      className="member-pic"
                    />
                    <p>{follower.name || "Unknown User"}</p>
                  </div>
                ))
              ) : (
                <p>No follower to display.</p>
              )}
            </div>
          </div>

          {/* Main Section */}
          {/* Main Section */}
          <section className="page-main-section">
            {pageCreator && <PagePostCreator />}
            <h3>Posts</h3>
            <PostList
              contextType="Page"
              contextId={pageId}
              postType="PagePosts"
            />
          </section>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default Pages;

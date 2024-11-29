import React from "react";
import "../styles/components/Page.css";
import PostList from "../components/Post/PostList";
import PagePostCreator from "../components/Pages/PagePostCreator";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { getDoc } from "firebase/firestore";
import { usePages } from "../context/PagesContext";
import { useAuth } from "../context/AuthContext";

const posts = [
  {
    userName: "Alice Johnson",
    userAvatar: "https://via.placeholder.com/50",
    timestamp: "Just now",
    content: "Exploring the beauty of nature 🌿",
    image: "https://via.placeholder.com/600x400",
  },
  {
    userName: "Bob Smith",
    userAvatar: "https://via.placeholder.com/50",
    timestamp: "1 hour ago",
    content: "Had a fantastic day at the park!",
  },
  {
    userName: "Bob Smith",
    userAvatar: "https://via.placeholder.com/50",
    timestamp: "1 hour ago",
    content: "Had a fantastic day at the park!",
  },
  {
    userName: "Bob Smith",
    userAvatar: "https://via.placeholder.com/50",
    timestamp: "1 hour ago",
    content: "Had a fantastic day at the park!",
  },
];

function Pages() {
  const { pageId } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [userData, setUserData] = useState(null);
  const { currentUser } = useAuth();

  const { pages, fetchPageByPageId, followPage, unFollowPage } = usePages();

  useEffect(() => {
    if (pageId) {
      fetchPageByPageId(pageId); // Fetch group when component mounts or groupId changes
    }
  }, [pageId, fetchPageByPageId]);

  let pageCreator = false;

  if (pages.creatorId === currentUser.uid) {
    pageCreator = true;
  }

  const isFollower = (pages?.followersId || []).includes(currentUser?.uid);

  const handleFollowButton = async () => {
    if (!pageId || !currentUser.uid) {
      console.error("Page ID or User ID is missing.");
      return;
    }

    try {
      await followPage(pageId, currentUser.uid, pages.followers);
      alert("You have successfully followed the page!");
      // Re-fetch group data and membership status
      //I do this so that after someone joins, the page refreshes itself
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
      await unFollowPage(pageId, currentUser.uid);
      alert("You have successfully unfollowed the page!");
      pages.followers = pages.followers - 1;

      // Re-fetch group data or update local state
      await fetchPageByPageId(pageId);
    } catch (error) {
      console.error("Failed to unfollow page:", error);
      alert("Error: Unable to unfollow page.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-banner"></div>
          <div className="page-info">
            <img
              src={pages?.photoURL}
              alt="Page Photo"
              className="page-avatar"
            />
            <h2>{pages.name}</h2>
            <p>Page · {pages.followers} Followers</p>
            {isFollower ? (
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

        {/* Page Action Bar */}
        <div className="page-action-bar">
          {pageCreator && <button className="edit-btn">Edit Page</button>}
        </div>

        {/* Page Content */}
        <div className="page-content">
          {/* Sidebar */}
          <aside className="page-sidebar">
            <div className="about-section">
              <h3>About</h3>
              <p>{pages.about}</p>
            </div>
            <div className="stats-section">
              <div className="stat-item">
                <strong>{pages.followers}</strong>
                <span>Followers</span>
              </div>
              <div className="stat-item">
                <strong>45</strong>
                <span>Posts Today</span>
              </div>
            </div>
            <div className="members-section">
              <h3>Members</h3>
              <div className="member">
                <img
                  src="https://via.placeholder.com/50"
                  alt="Member 1"
                  className="member-pic"
                />
                <p>Jane Smith</p>
              </div>
              <div className="member">
                <img
                  src="https://via.placeholder.com/50"
                  alt="Member 2"
                  className="member-pic"
                />
                <p>John Doe</p>
              </div>
              <a href="#" className="view-more">
                View All Members
              </a>
            </div>
          </aside>

          {/* Main Section */}
          <section className="page-main-section">
            {pageCreator && <PagePostCreator />}
            <h3>Posts</h3>
            <PostList posts={posts} />
          </section>
        </div>
      </div>
    </>
  );
}

export default Pages;

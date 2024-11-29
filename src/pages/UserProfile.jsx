import React, { useState } from "react";
import "../styles/components/UserProfile.css";
import Navbar from "../components/Navbar";
import { auth, db } from "../firebase/firebaseConfig";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { usePosts } from "../context/PostContext";
import PostList from "../components/Post/PostList";
import ListMyPosts from "../components/Post/ListMyPosts";
import UserProfileEditor from "../components/UserProfile/UserProfileEditor";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("about");
  const { currentUser } = useAuth(); //we get the current user.
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = React.useState(true);
  const { uid } = useParams();
  const [isFriend, setIsFriend] = useState(false);
  const [friends, setFriends] = useState([]);
  const [userById, setUserById] = useState([]);
  const navigate = useNavigate();
  const { posts, fetchUserData } = usePosts();
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestReceived, setFriendRequestReceived] = useState(false);

  useEffect(() => {
    // Fetch user data after login
    const fetchData = async () => {
      console.log(uid);
      const data = await fetchUserData(uid);
      setUserData(data);
      console.log(data);
    };
    fetchData();
  }, [uid]); // Run once when component mounts

  useEffect(() => {
    const checkFriendshipStatus = async () => {
      const friendshipsRef = collection(db, "Friendships");
      const friendRequestsRef = collection(db, "FriendRequests");

      // Check if they are already friends
      const q1 = query(
        friendshipsRef,
        where("user1", "==", currentUser.uid),
        where("user2", "==", uid)
      );
      const q2 = query(
        friendshipsRef,
        where("user1", "==", uid),
        where("user2", "==", currentUser.uid)
      );
      const [result1, result2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      if (!result1.empty || !result2.empty) {
        setIsFriend(true);
        setLoading(false);
        return;
      }

      // Check if a friend request has been sent
      const q3 = query(
        friendRequestsRef,
        where("sender", "==", currentUser.uid),
        where("receiver", "==", uid)
      );
      const q4 = query(
        friendRequestsRef,
        where("sender", "==", uid),
        where("receiver", "==", currentUser.uid)
      );
      const [sentRequests, receivedRequests] = await Promise.all([
        getDocs(q3),
        getDocs(q4),
      ]);
      setFriendRequestSent(!sentRequests.empty);
      setFriendRequestReceived(!receivedRequests.empty);
      setLoading(false);
    };

    checkFriendshipStatus();
  }, [uid, currentUser]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSendFriendRequest = async () => {
    try {
      const friendRequestsRef = collection(db, "FriendRequests");
      await addDoc(friendRequestsRef, {
        sender: currentUser.uid,
        receiver: uid,
        timestamp: new Date(),
      });
      setFriendRequestSent(true);
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleAcceptFriendRequest = async () => {
    try {
      // Add to Friendships
      const friendshipsRef = collection(db, "Friendships");
      await addDoc(friendshipsRef, {
        user1: currentUser.uid < uid ? currentUser.uid : uid,
        user2: currentUser.uid > uid ? currentUser.uid : uid,
        timestamp: new Date(),
      });

      // Delete the friend request
      const friendRequestsRef = collection(db, "FriendRequests");
      const q = query(
        friendRequestsRef,
        where("sender", "==", uid),
        where("receiver", "==", currentUser.uid)
      );
      const requestSnapshot = await getDocs(q);
      if (!requestSnapshot.empty) {
        await deleteDoc(requestSnapshot.docs[0].ref);
      }

      setIsFriend(true);
      setFriendRequestReceived(false);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleCancelFriendRequest = async () => {
    try {
      const friendRequestsRef = collection(db, "FriendRequests");
      const q = query(
        friendRequestsRef,
        where("sender", "==", currentUser.uid),
        where("receiver", "==", uid)
      );
      const requestSnapshot = await getDocs(q);
      if (!requestSnapshot.empty) {
        await deleteDoc(requestSnapshot.docs[0].ref);
      }
      setFriendRequestSent(false);
    } catch (error) {
      console.error("Error cancelling friend request:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  //I get the visited user's ID from the URL, and compare it to the logged in.
  //If they are not friends,(which we will check above this), we add them.
  const handleAddFriend = async () => {
    try {
      const friendshipsRef = collection(db, "Friendships");
      await addDoc(friendshipsRef, {
        user1: currentUser.uid < uid ? currentUser.uid : uid,
        user2: currentUser.uid > uid ? currentUser.uid : uid,
        timestamp: new Date(),
      });
      setIsFriend(true);
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  //IMPLEMENT DELETE FRIEND
  const handleDeleteFriend = async () => {
    try {
      const friendshipsRef = collection(db, "Friendships");

      // Query to find the friendship document
      const q1 = query(
        friendshipsRef,
        where("user1", "==", currentUser.uid),
        where("user2", "==", uid)
      );
      const q2 = query(
        friendshipsRef,
        where("user1", "==", uid),
        where("user2", "==", currentUser.uid)
      );

      const [result1, result2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const friendshipDoc = result1.docs[0] || result2.docs[0]; // Get the document if it exists

      if (friendshipDoc) {
        await deleteDoc(friendshipDoc.ref);
        setIsFriend(false);
      }
    } catch (error) {
      console.error("Error deleting friend:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  const handleEditProfile = () => {
    navigate(`/edit-user-profile/${currentUser.uid}`);
  };

  return (
    <>
      <Navbar />
      <div className="user-profile-page">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-banner">
            <img
              src="https://via.placeholder.com/1200x300"
              alt="Profile Banner"
              className="banner-image"
            />
          </div>
          <div className="profile-info">
            <img
              src={userData?.photoURL || "https://via.placeholder.com/150"}
              alt="User Avatar"
              className="avatar"
            />
            <div className="profile-details">
              <h1 className="username">{userData?.name}</h1>
              {uid === currentUser.uid ? (
                <button
                  className="update-profile-button"
                  onClick={handleEditProfile}
                >
                  Update Profile
                </button>
              ) : (
                <div>
                  <div>
                    {isFriend ? (
                      <button
                        onClick={handleDeleteFriend}
                        className="delete-friend-button"
                      >
                        Delete Friend
                      </button>
                    ) : friendRequestSent ? (
                      <button
                        onClick={handleCancelFriendRequest}
                        className="delete-friend-button"
                      >
                        Cancel Friend Request
                      </button>
                    ) : friendRequestReceived ? (
                      <button
                        onClick={handleAcceptFriendRequest}
                        className="accept-friend-request-button"
                      >
                        Accept Friend Request
                      </button>
                    ) : (
                      <button
                        onClick={handleSendFriendRequest}
                        className="add-friend-button"
                      >
                        Send Friend Request
                      </button>
                    )}
                  </div>
                </div>
              )}
              <p className="bio">
                Full-stack developer, coffee lover, and traveler 🌍
              </p>
            </div>
          </div>
        </div>

        {/* Tabs for Sections */}
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "about" ? "active" : ""}`}
            onClick={() => handleTabChange("about")}
          >
            About
          </button>
          <button
            className={`tab-button ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => handleTabChange("friends")}
          >
            Friends
          </button>
          <button
            className={`tab-button ${activeTab === "photos" ? "active" : ""}`}
            onClick={() => handleTabChange("photos")}
          >
            Photos
          </button>
          <button
            className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => handleTabChange("posts")}
          >
            Posts
          </button>
        </div>

        {/* Content Area */}
        <div className="tab-content">
          {activeTab === "about" && (
            <div className="about-section">
              <h2>About</h2>
              <p>
                Hi, I’m John! I’m passionate about building web applications and
                exploring new technologies.
              </p>
              <ul>
                <li>Location: Toronto, Canada</li>
                <li>Profession: Software Developer</li>
                <li>Hobbies: Coding, hiking, photography</li>
              </ul>
            </div>
          )}
          {activeTab === "friends" && (
            <div className="friends-section">
              <h2>Friends</h2>
              <div className="friends-list">
                <div className="friend-card">
                  <img src={currentUser?.photoURL} alt="friend" />
                  <p>Geri</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === "photos" && (
            <div className="photos-section">
              <h2>Photos</h2>
              <div className="photos-grid">
                <img src="https://via.placeholder.com/200" alt="Photo 1" />
                <img src="https://via.placeholder.com/200" alt="Photo 2" />
                <img src="https://via.placeholder.com/200" alt="Photo 3" />
              </div>
            </div>
          )}
          {activeTab === "posts" && (
            <div className="posts-section">
              <h2>Posts</h2>
              <ListMyPosts />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfile;

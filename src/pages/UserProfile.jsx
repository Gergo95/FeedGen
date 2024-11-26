import React, { useState } from "react";
import "../styles/components/UserProfile.css";
import Navbar from "../components/Navbar";
import { auth, db } from "../firebase/firebaseConfig";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
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

/*

In the UserProfile component, use the useParams hook to extract
 the userId from the URL and fetch the user’s data from Firestore.
*/

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("about");
  const { currentUser } = useAuth(); //we get the current user.
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = React.useState(true);
  const { uid } = useParams();
  const [isFriend, setIsFriend] = useState(false);
  const [friends, setFriends] = useState([]);
  const [userById, setUserById] = useState([]);

  const { posts, fetchUserData } = usePosts();

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

  if (!currentUser) {
    return <p className="spinner">Loading...</p>;
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const fetchFriendshipStatus = async () => {
    try {
      const friendshipsRef = collection(db, "Friendships");

      // Query to check if they are friends
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
      setIsFriend(!result1.empty || !result2.empty); // True if any document exists
    } catch (error) {
      console.error("Error checking friendship status:", error);
    } finally {
      setLoading(false);
    }
  };

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

  //FETCH ALL FRIENDS
  //FOR THE Friends field of User Profile
  // !!!!!!!!! IMPLEMENT
  const fetchAllFriends = async (uid) => {
    const friendshipsRef = collection(db, "Friendships");

    // Query friendships where userId is either user1 or user2
    const q1 = query(friendshipsRef, where("user1", "==", uid));
    const q2 = query(friendshipsRef, where("user2", "==", uid));

    const friends = [];

    // Fetch user1 results
    const query1Snapshot = await getDocs(q1);
    query1Snapshot.forEach((doc) => {
      const data = doc.data();
      friends.push(data.user2); // Add the other user
    });

    // Fetch user2 results
    const query2Snapshot = await getDocs(q2);
    query2Snapshot.forEach((doc) => {
      const data = doc.data();
      friends.push(data.user1); // Add the other user
    });

    return friends;
  };

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friendsData = await fetchAllFriends(currentUser.uid);

        setFriends(friendsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFriends();
  }, []);

  //IMPLEMENT THE useEffect that check if they are friends.
  useEffect(() => {
    if (uid !== currentUser.uid) {
      fetchFriendshipStatus();
    } else {
      setLoading(false);
    }
  }, [uid, currentUser]);

  if (loading) return <p>Loading...</p>;

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
              src={userData?.photoURL}
              alt="User Avatar"
              className="avatar"
            />
            <div className="profile-details">
              <h1 className="username">{userData?.name}</h1>
              {console.log(userData)}
              {uid === currentUser.uid ? (
                <p>Update Profile</p>
              ) : (
                <div>
                  {isFriend ? (
                    <button
                      className="delete-friend-button"
                      onClick={handleDeleteFriend}
                    >
                      Delete Friend
                    </button>
                  ) : (
                    <button
                      className="add-friend-button"
                      onClick={handleAddFriend}
                    >
                      Add Friend
                    </button>
                  )}
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
                  <img src={currentUser?.photoURL} alt="logo" />
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

              {/* {posts.map((post) => (
                <div key={post.id} className="post">
                  <p>{post.postContent}</p>
                  <img src={post?.imageUrl} alt="Post Picture" />
                  {console.log(post)}
                </div>
              ))} */}
              <ListMyPosts />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfile;

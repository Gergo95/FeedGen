import React, { useState, useEffect, useRef } from "react";
import "../styles/components/UserProfile.css";
import Navbar from "../components/Navbar";
import { auth, db } from "../firebase/firebaseConfig";
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
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { usePosts } from "../context/PostContext";
import PostList from "../components/Post/PostList";
import UserProfileEditor from "../components/UserProfile/UserProfileEditor";
import { useUserProf } from "../context/UserProfileContext";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("about");
  const { currentUser } = useAuth(); //we get the current user.
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { uid } = useParams();
  const [isFriend, setIsFriend] = useState(false);
  const [friends, setFriends] = useState([]);
  const [userById, setUserById] = useState([]);
  const navigate = useNavigate();
  const { posts, fetchUserData } = usePosts();
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestReceived, setFriendRequestReceived] = useState(false);
  const [myFriends, setMyFriends] = useState([]);
  const { fetchFriends } = useUserProf();

  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [pages, setPages] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    console.log("UserProfile useEffect called for friends");
    const loadFriends = async () => {
      if (!uid) {
        console.log("No UID provided");
        return;
      }
      try {
        const fetchedFriends = await fetchFriends(uid); // Fetch friends for the new UID
        console.log("Fetched friends:", fetchedFriends);
        setMyFriends(fetchedFriends);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    loadFriends();
  }, [uid, fetchFriends]); // Trigger when `uid` changes

  useEffect(() => {
    // Fetch user data after login
    const fetchData = async () => {
      console.log("Fetching data for UID:", uid);
      try {
        const data = await fetchUserData(uid);
        setUserData(data);
        console.log("Fetched User Data:", data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, [uid, fetchUserData]);

  useEffect(() => {
    const checkFriendshipStatus = async () => {
      if (!uid || !currentUser) {
        console.log("UID or currentUser is missing");
        setLoading(false);
        return;
      }

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

      // Check if a friend request has been sent or received
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

  useEffect(() => {
    if (!uid) return;

    const groupsRef = collection(db, "Groups");
    const eventsRef = collection(db, "Events");
    const pagesRef = collection(db, "Pages");

    // Queries
    const groupsQuery = query(
      groupsRef,
      where("createdBy", "==", uid),
      orderBy("createdAt", "desc")
    );
    const eventsQuery = query(
      eventsRef,
      where("creatorId", "==", uid),
      orderBy("date", "asc")
    );
    const pagesQuery = query(
      pagesRef,
      where("creatorId", "==", uid),
      orderBy("createdAt", "desc")
    );

    // real-time listeners
    const unsubscribeGroups = onSnapshot(
      groupsQuery,
      (snapshot) => {
        const fetchedGroups = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(fetchedGroups);
        console.log("Fetched Groups:", fetchedGroups);
      },
      (error) => {
        console.error("Error fetching groups:", error);
      }
    );

    const unsubscribeEvents = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const fetchedEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(fetchedEvents);
        console.log("Fetched Events:", fetchedEvents);
      },
      (error) => {
        console.error("Error fetching events:", error);
      }
    );

    const unsubscribePages = onSnapshot(
      pagesQuery,
      (snapshot) => {
        const fetchedPages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPages(fetchedPages);
        console.log("Fetched Pages:", fetchedPages);
      },
      (error) => {
        console.error("Error fetching pages:", error);
      }
    );

    // Set loading to false after initial fetch
    const handleInitialLoad = () => {
      setActivityLoading(false);
    };

    handleInitialLoad();

    // Cleanup listeners on unmount or uid change
    return () => {
      unsubscribeGroups();
      unsubscribeEvents();
      unsubscribePages();
    };
  }, [uid]);

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
      console.log("Friend request sent");
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
        console.log("Friend request accepted and deleted");
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
        console.log("Friend request cancelled and deleted");
      }
      setFriendRequestSent(false);
    } catch (error) {
      console.error("Error cancelling friend request:", error);
    }
  };

  //I get the visited user's ID from the URL, and compare it to the logged in.
  //If they are not friends, we add them.
  const handleAddFriend = async () => {
    try {
      const friendshipsRef = collection(db, "Friendships");
      await addDoc(friendshipsRef, {
        user1: currentUser.uid < uid ? currentUser.uid : uid,
        user2: currentUser.uid > uid ? currentUser.uid : uid,
        timestamp: new Date(),
      });
      setIsFriend(true);
      console.log("Friend added");
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
        console.log("Friendship deleted");
      } else {
        console.log("Friendship document not found");
      }
    } catch (error) {
      console.error("Error deleting friend:", error);
    }
  };

  if (loading || activityLoading) return <p>Loading...</p>;

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
            Activity
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
              <p>{userData?.about}</p>
              <ul>
                <li>Profession: {userData?.job}</li>
                <li>Relationship Status: {userData?.relationshipStatus}</li>
                <li>School: {userData?.school}</li>
                <li>Gender: {userData?.gender}</li>
                <li>Date of Birth: {userData?.dob}</li>
              </ul>
            </div>
          )}
          {activeTab === "friends" && (
            <div className="friends-section">
              <h2>Friends</h2>
              <div className="friends-list">
                {myFriends.length > 0 ? (
                  myFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="friend-card"
                      onClick={() => navigate(`/user/${friend.id}`)}
                    >
                      <img
                        src={
                          friend.photoURL || "https://via.placeholder.com/100"
                        }
                        alt="friend"
                      />
                      <p>{friend.name || "Unknown User"}</p>
                    </div>
                  ))
                ) : (
                  <p>No friends to display.</p>
                )}
              </div>
            </div>
          )}
          {activeTab === "photos" && (
            <div className="activity-section">
              <h2>Activity</h2>

              {/* Groups */}
              <div className="activity-subsection">
                <h3>Groups Created</h3>
                {groups.length > 0 ? (
                  <div className="activity-list">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="activity-card"
                        onClick={() => navigate(`/group-profile/${group.id}`)}
                      >
                        <img
                          src={
                            group.photoURL || "https://via.placeholder.com/100"
                          }
                          alt={group.name}
                          className="activity-image"
                        />
                        <p>{group.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No groups created.</p>
                )}
              </div>

              {/* Events */}
              <div className="activity-subsection">
                <h3>Events Created</h3>
                {events.length > 0 ? (
                  <div className="activity-list">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="activity-card"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        <img
                          src={
                            event.photoURL || "https://via.placeholder.com/100"
                          }
                          alt={event.name}
                          className="activity-image"
                        />
                        <p>{event.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No events created.</p>
                )}
              </div>

              {/* Pages */}
              <div className="activity-subsection">
                <h3>Pages Created</h3>
                {pages.length > 0 ? (
                  <div className="activity-list">
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        className="activity-card"
                        onClick={() => navigate(`/pages/${page.id}`)}
                      >
                        <img
                          src={
                            page.photoURL || "https://via.placeholder.com/100"
                          }
                          alt={page.name}
                          className="activity-image"
                        />
                        <p>{page.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No pages created.</p>
                )}
              </div>
            </div>
          )}
          {activeTab === "posts" && (
            <div className="posts-section">
              <h2>Posts</h2>
              <PostList userId={uid} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfile;

import React, { useEffect, useState } from "react";
import PostCreator from "../components/Post/PostCreator";
import PostList from "../components/Post/PostList";
import Navbar from "../components/Navbar";
import "../styles/components/Groups.css";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { useGroups } from "../context/GroupContext";
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
];

function Groups() {
  const { groupId } = useParams();
  const { currentUser } = useAuth();
  const { groups, loading, error, fetchGroupByGroupId, joinGroup, leaveGroup } =
    useGroups();

  let groupCreator = false;
  let isMember = false;

  useEffect(() => {
    if (groupId) {
      fetchGroupByGroupId(groupId); // Fetch group when component mounts or groupId changes
    }
  }, [groupId, fetchGroupByGroupId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!groups) return <div>Group not found</div>;

  if (groups.createdBy === currentUser.uid) {
    groupCreator = true;
  }

  if (groups.memberId.includes(currentUser.uid)) {
    isMember = true;
  }

  const handleJoinButton = async () => {
    if (!groupId || !currentUser.uid) {
      console.error("Group ID or User ID is missing.");
      return;
    }

    try {
      await joinGroup(currentUser.uid, groupId, groups.members);
      alert("You have successfully joined the group!");
      // Re-fetch group data and membership status
      //I do this so that after someone joins, the page refreshes itself
      await fetchGroupByGroupId(groupId);
    } catch (error) {
      console.error("Failed to join group:", error);
      alert("Error: Unable to join the group.");
    }
  };

  const handleLeaveButton = async () => {
    if (!groupId || !currentUser?.uid) {
      console.error("Group ID or User ID is missing.");
      return;
    }

    try {
      await leaveGroup(groupId, currentUser.uid, groups.members);
      alert("You have successfully left the group!");
      groups.members = groups.members - 1;

      // Re-fetch group data or update local state
      await fetchGroupByGroupId(groupId);
    } catch (error) {
      console.error("Failed to leave group:", error);
      alert("Error: Unable to leave the group.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="group-container">
        {/* Group Header */}

        <div className="group-header">
          <div className="group-banner"></div>
          <div className="group-info">
            <img
              src={groups?.photoURL}
              alt="CsoportKép"
              className="group-avatar"
            />
            <h2>{groups.name}</h2>
            <p>Group · {groups.members} Members</p>
            {isMember ? (
              <button className="leave-btn" onClick={handleLeaveButton}>
                Leave Group
              </button>
            ) : (
              <button className="action-btn" onClick={handleJoinButton}>
                Join Group
              </button>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="group-action-bar">
          {groupCreator ? (
            <button className="edit-btn">Edit Group</button>
          ) : isMember ? (
            <>
              {/* Group Content */}
              <div className="group-content">
                {/* Sidebar */}
                <aside className="group-sidebar">
                  <div className="about-section">
                    <h3>About</h3>
                    <p>{groups.description}</p>
                  </div>
                  <div className="stats-section">
                    <div className="stat-item">
                      <strong>{groups.members}</strong>
                      <span>Members</span>
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
                <section className="group-main-section">
                  <PostCreator />
                  <h3>Posts</h3>
                  <PostList posts={posts} />
                </section>
              </div>
            </>
          ) : (
            <div>
              {/* Sidebar */}
              <div>
                <h3>You have to Join the Group to be able to participate</h3>
              </div>
              <aside className="group-sidebar">
                <div className="about-section">
                  <h3>About</h3>
                  <p>{groups.description}</p>
                </div>
                <div className="stats-section">
                  <div className="stat-item">
                    <strong>{groups.members}</strong>
                    <span>Members</span>
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
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Groups;

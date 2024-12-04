import React, { useEffect, useState } from "react";
import PostCreator from "../components/Post/PostCreator";
import PostList from "../components/Post/PostList";
import Navbar from "../components/Navbar";
import "../styles/components/Groups.css";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { useGroups } from "../context/GroupContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Groups() {
  const { groupId } = useParams();
  const { currentUser } = useAuth();
  const { groups, loading, error, fetchGroupByGroupId, joinGroup, leaveGroup } =
    useGroups();

  const [groupMembers, setGroupMembers] = useState([]);
  let groupCreator = false;
  let isMember = false;
  const navigate = useNavigate();

  useEffect(() => {
    if (groupId) {
      fetchGroupByGroupId(groupId);
    }
  }, [groupId, fetchGroupByGroupId]);

  useEffect(() => {
    // Fetch group members' details
    const fetchGroupMembers = async () => {
      if (groups?.memberId?.length > 0) {
        const membersData = await Promise.all(
          groups.memberId.map(async (memberId) => {
            const userRef = doc(db, "Users", memberId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              return { id: memberId, ...userSnap.data() };
            }
            return null;
          })
        );
        setGroupMembers(membersData.filter((member) => member !== null));
      }
    };

    fetchGroupMembers();
  }, [groups]);

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
      toast.success("You have successfully joined the Group!!", {
        position: "top-center",
      });
      await fetchGroupByGroupId(groupId);
    } catch (err) {
      console.error("Failed to join group:", err);
      toast.error(err.message, {
        position: "bottom-center",
      });
    }
  };

  const handleLeaveButton = async () => {
    if (!groupId || !currentUser?.uid) {
      console.error("Group ID or User ID is missing.");
      return;
    }

    try {
      await leaveGroup(groupId, currentUser.uid, groups.members);
      toast.success("You have successfully left the Group!!", {
        position: "top-center",
      });
      await fetchGroupByGroupId(groupId);
    } catch (err) {
      console.error("Failed to leave group:", err);
      toast.error(err.message, {
        position: "bottom-center",
      });
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "Groups", groupId));
      toast.success("Group deleted successfully!", {
        position: "top-center",
      });
      navigate("/feed");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group.", {
        position: "bottom-center",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="group-container">
        {/* Group Header */}
        <div className="group-header">
          <div className="group-banner">
            <img
              src={groups?.photoURL || "https://via.placeholder.com/1200x200"}
              alt="Group Banner"
              className="group-avatar"
            />
          </div>
          <div className="group-info">
            <h2>{groups.name}</h2>
            {groupCreator ? (
              <>
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/edit-group-profile/${groupId}`)}
                >
                  Edit Group
                </button>
                <button
                  className="leave-btn"
                  onClick={() => handleDeleteGroup(groupId)}
                >
                  Delete Group
                </button>
              </>
            ) : isMember ? (
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

        {/* Group Content */}
        <div className="group-content">
          {isMember ? (
            <div className="group-sidebar">
              {/* Sidebar Content */}
              <div className="about-section">
                <h3>About</h3>
                <p>{groups.description}</p>
              </div>
              <div className="stats-section">
                <div className="stat-item">
                  <strong>Members: {groups.members}</strong>
                </div>
              </div>
              <div className="members-section">
                {groupMembers.length > 0 ? (
                  groupMembers.map((member) => (
                    <div key={member.id} className="member">
                      <img
                        src={
                          member.photoURL || "https://via.placeholder.com/50"
                        }
                        alt={member.name || "Unknown"}
                        className="member-pic"
                      />
                      <p>{member.name || "Unknown User"}</p>
                    </div>
                  ))
                ) : (
                  <p>No members to display.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="group-sidebar">
              <h3>You need to join the group to participate</h3>
              <div className="about-section">
                <h3>About</h3>
                <p>{groups.description}</p>
              </div>
              <div className="stats-section">
                <div className="stat-item">
                  <strong>{groups.members}</strong>
                  <span>Members</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Section */}
          {isMember && (
            <section className="group-main-section">
              <PostCreator contextType="Group" contextId={groupId} />
              <h3>Posts</h3>
              <PostList contextType="Group" contextId={groupId} />
            </section>
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default Groups;

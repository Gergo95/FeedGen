import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import "../../styles/components/ListGroups.css";
import { useGroups } from "../../context/GroupContext";
import { Link } from "react-router-dom";

const ListGroups = () => {
  const { currentUser } = useAuth();
  const { fetchGroupsYourMember } = useGroups();
  const [selectedGroups, setSelectedGroups] = useState(null);

  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groupsData = await fetchGroupsYourMember(currentUser.uid);
        setGroups(groupsData);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    loadGroups();
  }, [fetchGroupsYourMember]);

  return (
    <>
      <div className="group-list">
        {groups.map((groups) => (
          <div>
            <Link to={`/group-profile/${groups.id}`}>
              <div
                className={`group-card ${
                  selectedGroups?.id === groups.id ? "active" : ""
                }`}
                key={groups.id}
                onClick={() => {
                  setSelectedGroups(groups);
                }}
              >
                <img
                  src={groups?.photoURL}
                  alt={groups.name}
                  className="group-image"
                />
                <h2>{groups.name}</h2>
                <p>{groups.description}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};

export default ListGroups;

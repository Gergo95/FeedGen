import React, { useState } from "react";
import "../styles/components/feed.css";
import PostList from "../components/Post/PostList";
import PostCreator from "../components/Post/PostCreator";
import ChatSidebar from "../components/Chat/ChatSidebar";
import FilterPagePost from "../components/Post/FilterPagePost";
import Navbar from "../components/Navbar";
import GroupsPages from "../components/LeftSidebar/GroupsPages";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChatProvider } from "../context/ChatContext";
import ChatWindow from "../components/Chat/ChatWindow";

const groups = [
  { id: 1, name: "React Developers" },
  { id: 2, name: "Fitness Enthusiasts" },
];

const pages = [
  { id: 1, name: "Tech News" },
  { id: 2, name: "Travel Blog" },
];

const events = [
  { id: 1, name: "React Workshop" },
  { id: 2, name: "Marathon 2024" },
];

function FeedPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [openChats, setOpenChats] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedOption, setSelectedOption] = useState("pages"); // New state for toggle

  const handleOpenChat = (friend) => {
    // Check if the chat is already open, if not, add it to the openChats
    console.log("Opening chat with friend:", friend); // Log the friend data when you try to open the chat

    if (!openChats.some((chat) => chat.uid === friend.uid)) {
      console.log("Adding new chat to openChats array:", friend);

      setOpenChats([...openChats, friend]);
    } else {
      console.log("Chat already open for:", friend.uid);
    }
  };

  const closeChat = (friendId) => {
    setOpenChats(openChats.filter((chat) => chat.uid !== friendId));
  };

  const [filter, setFilter] = useState("all");

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    console.log("Selected Filter:", selectedFilter);
  };

  return (
    <>
      <Navbar />
      <div className="feed-container">
        {/* User groups, pages, and events + calendar */}
        <div className="feed-column left-column">
          <GroupsPages
            user={currentUser}
            groups={groups}
            pages={pages}
            events={events}
          />
        </div>

        {/* Middle Column: MainFeed */}
        <div className="feed-column middle-column">
          <PostCreator />

          {/* Toggle between Pages and Friends */}
          <div className="toggle-container">
            <button
              className={
                selectedOption === "pages"
                  ? "toggle-button active"
                  : "toggle-button"
              }
              onClick={() => setSelectedOption("pages")}
            >
              Pages
            </button>
            <button
              className={
                selectedOption === "friends"
                  ? "toggle-button active"
                  : "toggle-button"
              }
              onClick={() => setSelectedOption("friends")}
            >
              Friends
            </button>
          </div>

          {/* Conditionally render components based on selectedOption */}
          {selectedOption === "pages" ? <FilterPagePost /> : <PostList feed />}

          {/* Modal for Detailed Post View */}
          {selectedPost && (
            <div>
              <h2>{selectedPost.userName}</h2>
              <p>{selectedPost.content}</p>
              <img src={selectedPost.imageUrl} alt={selectedPost.title} />
            </div>
          )}
        </div>

        {/* Right Column: Chat */}
        <div className="feed-column right-column">
          <ChatProvider>
            <div style={{ display: "flex", height: "100vh" }}>
              {/* Chat Sidebar */}
              <ChatSidebar
                currentUser={currentUser}
                openChat={handleOpenChat}
              />
            </div>
            {/* Pop-Up Chat Windows */}
            {openChats?.map((chat) => (
              <ChatWindow
                key={chat.uid}
                friend={chat}
                currentUser={currentUser}
                closeChat={() => closeChat(chat.uid)}
              />
            ))}
          </ChatProvider>
        </div>
      </div>
    </>
  );
}

export default FeedPage;

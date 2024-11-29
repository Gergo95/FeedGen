import React from "react";
import "../styles/components/feed.css";
import PostList from "../components/Post/PostList";
import PostCreator from "../components/Post/PostCreator";
import ChatSidebar from "../components/Chat/ChatSidebar";
import PostFilter from "../components/Post/PostFilter";
import FilterPagePost from "../components/Post/FilterPagePost";
import { useState } from "react";
import Navbar from "../components/Navbar";
import GroupsPages from "../components/LeftSidebar/GroupsPages";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChatProvider, useChat } from "../context/ChatContext";
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
  const { currentUser } = useAuth(); //we get the current user.
  const navigate = useNavigate();
  const [openChats, setOpenChats] = useState([]); // Make sure this is initialized as an empty array
  const [posts, setPosts] = useState([]);

  /* const handleSelectChat = (contact) => {
    setSelectedChat(contact);
    console.log("Selected Chat:", contact);
  };
 */
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

  // Function to handle closing the chat window
  const closeChat = (friendId) => {
    setOpenChats(openChats.filter((chat) => chat.uid !== friendId));
  };

  const [filter, setFilter] = useState("all");

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    // Optionally trigger filtering logic for PostsFeed
    console.log("Selected Filter:", selectedFilter);
  };

  return (
    <>
      <Navbar />
      <div className="feed-container">
        {/* Left Column: Groups & Pages */}
        <div className="feed-column left-column">
          <GroupsPages
            user={currentUser}
            groups={groups}
            pages={pages}
            events={events}
          />
        </div>

        {/* Middle Column: Posts */}
        <div className="feed-column middle-column">
          <PostCreator />
          {/* <PostFilter onFilterChange={handleFilterChange} /> */}
          <FilterPagePost />
          <PostList posts={posts} />
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
                openChat={handleOpenChat} // Pass function to open chat
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

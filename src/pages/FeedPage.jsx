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

const posts = [
  {
    id: "123",
    title: "Sample Post Title",
    content: "This is a sample post content for demonstration purposes.",
    imageUrl: "https://via.placeholder.com/400",
    likes: 5,
    comments: [
      { author: "John Doe", text: "Great post!" },
      { author: "Jane Smith", text: "I totally agree!" },
    ],
  },
  {
    id: "232",
    title: "Valami mas",
    content: "ThValaksdaskdaoskdantent for demonstration purposes.",
    imageUrl: "https://via.placeholder.com/400",
    likes: 5,
    comments: [
      { author: "Geris", text: "LOOOOOL!" },
      { author: "Petra", text: "I totally agree!" },
    ],
  },
  {
    id: "23s",
    title: "Valami mas",
    content: "ThValaksdaskdaoskdantent for demonstration purposes.",
    imageUrl: "https://via.placeholder.com/400",
    likes: 5,
    comments: [
      { author: "Geris", text: "LOOOOOL!" },
      { author: "Petra", text: "I totally agree!" },
    ],
  },
  {
    id: "2322",
    title: "Valami mas",
    content: "ThValaksdaskdaoskdantent for demonstration purposes.",
    imageUrl: "https://via.placeholder.com/400",
    likes: 5,
    comments: [
      { author: "Geris", text: "LOOOOOL!" },
      { author: "Petra", text: "I totally agree!" },
    ],
  },
];

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

const contacts = [
  {
    id: 1,
    name: "Alice Johnson",
    avatar: "https://via.placeholder.com/40",
    lastMessage: "See you soon!",
  },
  {
    id: 2,
    name: "Bob Smith",
    avatar: "https://via.placeholder.com/40",
    lastMessage: "Got it!",
  },
  {
    id: 3,
    name: "Charlie Brown",
    avatar: "https://via.placeholder.com/40",
    lastMessage: "",
  },
  {
    id: 4,
    name: "Charlie Brown",
    avatar: "https://via.placeholder.com/40",
    lastMessage: "",
  },
  {
    id: 5,
    name: "Charlie Brown",
    avatar: "https://via.placeholder.com/40",
    lastMessage: "",
  },
  {
    id: 6,
    name: "Charlie Brown",
    avatar: "https://via.placeholder.com/40",
    lastMessage: "",
  },
  {
    id: 7,
    name: "Charlie Brown",
    avatar: "https://via.placeholder.com/40",
    lastMessage: "",
  },
];

function FeedPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const { currentUser } = useAuth(); //we get the current user.
  const navigate = useNavigate();

  const handleSelectChat = (contact) => {
    setSelectedChat(contact);
    console.log("Selected Chat:", contact);
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
          <ChatSidebar contacts={contacts} onSelectChat={handleSelectChat} />
          {selectedChat && (
            <div>
              <h2>Chat with {selectedChat.name}</h2>
              {/* Replace with your chat window component */}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default FeedPage;

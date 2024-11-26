import React from "react";
import "../styles/components/home.css";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

const Home = () => {
  return (
    <div className="home-container">
      {/* Left Section */}
      <div className="left-section">
        <div className="branding">
          <img src="img/logo.png" alt="FeedGen Logo" className="logo" />
          <h1 className="app-name">FeedGen</h1>
        </div>
        <div className="features">
          <h2 className="features-title">What makes FeedGen special?</h2>
          <ul className="features-list">
            <li>📢 Share your thoughts via posts</li>
            <li>👥 Create groups, pages, and events</li>
            <li>💬 Chat with your friends</li>
            <li>✨ Customize your Feed</li>
          </ul>
        </div>
        <Login />
      </div>
    </div>
  );
};

export default Home;

import React, { useState } from "react";
import "../../styles/components/PostFilter.css";

const PostFilter = ({ onFilterChange }) => {
  const [filter, setFilter] = useState("all");

  const handleFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setFilter(selectedFilter);
    onFilterChange(selectedFilter); //Pass the selected filter back to the parent
  };

  return (
    <div className="post-filter">
      <label htmlFor="filter-select">Filter Posts:</label>
      <select
        id="filter-select"
        value={filter}
        onChange={handleFilterChange}
        className="filter-select"
      >
        <option value="all">All Posts</option>
        <option value="friends">Friends</option>
        <option value="groups">Groups</option>
        <option value="recent">Most Recent</option>
      </select>
    </div>
  );
};

export default PostFilter;

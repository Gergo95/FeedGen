import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/components/SearchResultsPage.css";
import Navbar from "../components/Navbar";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results = [] } = location.state || {};

  const handleResultClick = (result) => {
    alert(`You selected: ${result.name}`);
  };

  return (
    <>
      <Navbar />
      <div className="search-results-page">
        <div className="results-filtering">
          <div className="filter-item">
            <p>User</p>
          </div>
          <div className="filter-item">
            <p>Page</p>
          </div>
          <div className="filter-item">
            <p>Group</p>
          </div>
          <div className="filter-item">
            <p>Event</p>
          </div>
        </div>
        <div className="results">
          <h1>Search Results</h1>
          {results.length > 0 ? (
            <ul className="result-list">
              {results.map((result, index) => (
                <li
                  key={index}
                  className="result-item"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="result-avatar">
                    <img src={result.avatar} alt={result.name} />
                  </div>
                  <div className="result-details">
                    <p className="result-name">{result.name}</p>
                    <p className="result-info">{result.type}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No results to display.</p>
          )}
          <button className="back-button" onClick={() => navigate(-1)}>
            Back to Search
          </button>
        </div>
      </div>
    </>
  );
};

export default SearchResultsPage;

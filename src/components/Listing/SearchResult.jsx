import React from "react";
import "../../styles/components/SearchResult.css";
import { useNavigate } from "react-router-dom";

const SearchResult = ({ results, onResultClick }) => {
  const navigate = useNavigate();

  const handleViewAllClick = () => {
    navigate("/search-results", { state: { results } });
  };

  return (
    <div className="search-result">
      {results.length > 0 ? (
        <>
          <ul className="result-list">
            {results.slice(0, 5).map((result, index) => (
              <li
                key={index}
                className="result-item"
                onClick={() => onResultClick(result)}
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
          <button className="view-all-button" onClick={handleViewAllClick}>
            View All Results
          </button>
        </>
      ) : (
        <p className="no-results">No results found</p>
      )}
    </div>
  );
};

export default SearchResult;

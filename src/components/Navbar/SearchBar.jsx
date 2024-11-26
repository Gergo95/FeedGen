import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "../../styles/components/SearchBar.css";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (queryText) => {
    if (!queryText.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);

    try {
      const results = [];
      const collections = ["Users", "Groups", "Events", "Pages"];

      for (const col of collections) {
        const colRef = collection(db, col);
        const q = query(
          colRef,
          where("name", ">=", queryText),
          where("name", "<=", queryText + "\uf8ff")
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data(), type: col });
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleRedirect = (type, id) => {
    const routes = {
      Users: `/user/${id}`,
      Groups: `/group-profile/${id}`,
      Events: `/events/${id}`,
      Pages: `/pages/${id}`,
    };
    navigate(routes[type]);
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search for users, groups, events, or pages..."
        className="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {isLoading && <div className="loading-indicator">Loading...</div>}
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="search-result-item"
              onClick={() => handleRedirect(result.type, result.id)}
            >
              <img
                src={result.photoURL || "/default-avatar.png"}
                alt={`${result.name}'s avatar`}
                className="result-avatar"
              />
              <div>
                <p className="result-name">{result.name}</p>
                <span className="result-type">{result.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

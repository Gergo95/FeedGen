import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import "../../styles/components/ListPages.css";
import { usePages } from "../../context/PagesContext";
import { Link } from "react-router-dom"; // Import Link for navigation

const ListPages = () => {
  const { currentUser } = useAuth();
  const { fetchPagesByUser } = usePages();
  const [selectedPages, setSelectedPages] = useState(null);

  const [pages, setPages] = useState([]);

  useEffect(() => {
    const loadPages = async () => {
      try {
        const pagesData = await fetchPagesByUser(currentUser.uid);
        setPages(pagesData);
      } catch (error) {
        console.error("Error fetching pages:", error);
      }
    };
    loadPages();
  }, [fetchPagesByUser]);

  return (
    <>
      <div className="page-list">
        {pages.map((pages) => (
          <div>
            <Link to={`/pages/${pages.id}`}>
              <div
                className={`page-card ${
                  selectedPages?.id === pages.id ? "active" : ""
                }`}
                key={pages.id}
                onClick={() => {
                  setSelectedPages(pages);
                }}
              >
                <img
                  src={pages?.photoURL}
                  alt={pages.name}
                  className="page-image"
                />
                <h2>{pages.name}</h2>
                <p>{pages.about}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};

export default ListPages;

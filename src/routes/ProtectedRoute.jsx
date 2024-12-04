import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!currentUser) {
    console.log("ProtectedRoute - Redirecting to /home");
    return <Navigate to="/home" replace />;
  }

  console.log("ProtectedRoute - User authenticated:", currentUser);
  return children;
};

export default ProtectedRoute;

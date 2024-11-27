
import React, { useRef, useState }, { useContext, useState } from "react";

import { AppContext } from "../../context/AppContext";

import "./Header.css"; from './dummy';
 from './dummy';
import { signInWithGoogle } from "../../services/firebase";
 // Assuming firebase.js has this method

const Header = () => {
  const { currentMarkerType, setCurrentMarkerType } = useContext(AppContext);
  const [user, setUser] = useState(null);

  const handleToggle = (type) => {
    setCurrentMarkerType(type);
  };

  const handleSignIn = async () => {
    try {
      const userData = await signInWithGoogle();
      setUser(userData);
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Sign-in failed. Please try again.");
    }
  };

  return (
    <header>
      <div className="toggle-container">
        <div className="toggle-base"></div>
        <button
          className={`toggle-button ${currentMarkerType === "Cars" ? "active" : ""}`}
          onClick={() => handleToggle("Cars")}
        >
          Cars
        </button>
        <button
          className={`toggle-button ${currentMarkerType === "Stations" ? "active" : ""}`}
          onClick={() => handleToggle("Stations")}
        >
          Stations
        </button>
      </div>
      <div className="auth-container">
        {user ? (
          <div className="user-info">
            <img src={user.photoURL} alt="User Avatar" className="user-avatar" />
            <span>{user.displayName}</span>
          </div>
        ) : (
          <button className="sign-in-button" onClick={handleSignIn}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;

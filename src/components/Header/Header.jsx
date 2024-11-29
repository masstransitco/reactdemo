// src/components/Header/Header.jsx

import React, { useContext } from "react";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";
import "./Header.css";
import { AppContext } from "../../context/AppContext";
import { AuthContext } from "../../context/AuthContext";

const Header = () => {
  const { currentMarkerType, setCurrentMarkerType } = useContext(AppContext);
  const { user } = useContext(AuthContext);

  const handleToggle = () => {
    setCurrentMarkerType((prevType) =>
      prevType === "Cars" ? "Bikes" : "Cars"
    );
    // Additional logic to switch between 2D and 3D can be implemented here
  };

  return (
    <header className="app-header">
      <ToggleSwitch
        isOn={currentMarkerType === "Bikes"}
        handleToggle={handleToggle}
      />
      {user ? (
        <div className="user-avatar">
          <img src={user.photoURL} alt="User Avatar" />
          {/* Implement Dropdown here */}
        </div>
      ) : (
        <button className="sign-in-button">Sign In</button>
      )}
    </header>
  );
};

export default Header;

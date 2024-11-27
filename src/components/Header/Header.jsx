// src/components/Header/Header.jsx

import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import "./Header.css";

const Header = ({ onToggleScene }) => {
  // Receive the toggle function as a prop
  const { currentMarkerType, setCurrentMarkerType } = useContext(AppContext);

  const handleToggle = (type) => {
    setCurrentMarkerType(type);
  };

  return (
    <header className="app-header">
      <div className="toggle-container">
        <div className="toggle-base"></div>
        <button
          className={`toggle-button ${
            currentMarkerType === "Cars" ? "active" : ""
          }`}
          onClick={() => handleToggle("Cars")}
        >
          Cars
        </button>
        <button
          className={`toggle-button ${
            currentMarkerType === "Stations" ? "active" : ""
          }`}
          onClick={() => handleToggle("Stations")}
        >
          Stations
        </button>
      </div>
      <button className="scene-toggle-button" onClick={onToggleScene}>
        {/* You can use an icon here */}
        Toggle Scene
      </button>
    </header>
  );
};

export default Header;

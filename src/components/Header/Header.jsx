// src/components/Header/Header.jsx

import React, { useContext } from "react";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";

import "./Header.css";
import { AppContext } from "../../context/AppContext";

const Header = () => {
  const { currentMarkerType, setCurrentMarkerType } = useContext(AppContext);

  const handleToggle = () => {
    setCurrentMarkerType((prevType) =>
      prevType === "Cars" ? "Bikes" : "Cars"
    );
    // Additional logic to switch between 2D and 3D can be implemented here
  };

  return (
    <header className="app-header">
      <ToggleSwitch
        isOn={currentMarkerType === "3D"}
        handleToggle={handleToggle}
      />
    </header>
  );
};

Header.propTypes = {
  // No props passed to Header in this implementation
};

export default Header;

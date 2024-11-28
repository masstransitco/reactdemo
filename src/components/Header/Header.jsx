// src/components/Header/Header.jsx

import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch"; // Import ToggleSwitch
import "./Header.css";

const Header = () => {
  const { currentMarkerType, setCurrentMarkerType } = useContext(AppContext);

  const isOn = currentMarkerType === "Cars";

  const handleToggle = () => {
    setCurrentMarkerType(isOn ? "Stations" : "Cars");
  };

  return (
    <header className="app-header">
      <ToggleSwitch
        isOn={isOn}
        handleToggle={handleToggle}
        onLabel="Cars"
        offLabel="Stations"
      />
    </header>
  );
};

export default Header;

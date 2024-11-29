// src/components/ToggleSwitch/ToggleSwitch.jsx

import React from "react";
import PropTypes from "prop-types";
import "./ToggleSwitch.css";

const ToggleSwitch = ({ isOn, handleToggle }) => {
  return (
    <div
      className="toggle-switch"
      onClick={handleToggle}
      role="switch"
      aria-checked={isOn}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleToggle();
        }
      }}
    >
      <div className={`toggle-button ${isOn ? "active" : ""}`}>
        {isOn ? "Bikes" : "Cars"}
      </div>
    </div>
  );
};

ToggleSwitch.propTypes = {
  isOn: PropTypes.bool.isRequired,
  handleToggle: PropTypes.func.isRequired,
};

export default ToggleSwitch;

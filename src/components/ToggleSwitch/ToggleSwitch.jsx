// src/components/ToggleSwitch/ToggleSwitch.jsx

import React from "react";
import PropTypes from "prop-types";
import "./ToggleSwitch.css";

const ToggleSwitch = ({ isOn, handleToggle, onLabel, offLabel }) => {
  return (
    <div className="toggle-switch" onClick={handleToggle}>
      <div className={`toggle-button ${isOn ? "active" : ""}`}>
        {isOn ? onLabel : offLabel}
      </div>
    </div>
  );
};

ToggleSwitch.propTypes = {
  isOn: PropTypes.bool.isRequired,
  handleToggle: PropTypes.func.isRequired,
  onLabel: PropTypes.string,
  offLabel: PropTypes.string,
};

ToggleSwitch.defaultProps = {
  onLabel: "ON",
  offLabel: "OFF",
};

export default ToggleSwitch;

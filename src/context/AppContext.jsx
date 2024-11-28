// src/context/AppContext.jsx

import React, { createContext, useState } from "react";
import PropTypes from "prop-types";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentMarkerType, setCurrentMarkerType] = useState("Cars");

  return (
    <AppContext.Provider value={{ currentMarkerType, setCurrentMarkerType }}>
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

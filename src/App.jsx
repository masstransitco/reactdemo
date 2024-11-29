// src/App.jsx

import React from "react";
import MapSceneToggle from "./components/Map/MapSceneToggle";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/App.css";

const App = () => {
  return (
    <ErrorBoundary>
      <MapSceneToggle />
    </ErrorBoundary>
  );
};

export default App;

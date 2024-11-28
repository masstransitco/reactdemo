// src/App.jsx

import React, { useRef, useCallback, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import NotFound from "./components/NotFound";
import MapSceneToggle from "./components/Map/MapSceneToggle";
import "./app.css";
import debounce from "lodash.debounce"; // Ensure lodash.debounce is installed

function App() {
  const mapViewRef = useRef(null);
  const sceneViewRef = useRef(null);


  // Cleanup debounced functions on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      handleMapCameraChange.cancel();
      handleSceneCameraChange.cancel();
    };
  }, [handleMapCameraChange, handleSceneCameraChange]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Home>
              <MapSceneToggle />
            </Home>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

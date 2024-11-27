// src/components/Map/MapSceneToggle.jsx

import React, { useState, useRef } from "react";
import MapContainer from "./src/components/Map/MapContainer";
import SceneContainer from "./src/components/Scene/SceneContainer";
import Header from "./src/components/Header/Header";
import Footer from "./src/components/Footer/Footer";
import "./src/components/Map/MapSceneToggle.css";

const MapSceneToggle = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [isSceneVisible, setIsSceneVisible] = useState(false); // Visibility state
  const mapViewRef = useRef(null);
  const sceneViewRef = useRef(null);

  // Callback when a station is selected in the MapContainer or SceneContainer
  const handleStationSelect = (station) => {
    setSelectedStation(station);
    setIsSceneVisible(true); // Show the SceneContainer when a station is selected
  };

  // Callback to minimize the SceneContainer sidebar
  const handleSidebarMinimize = () => {
    setSelectedStation(null);
    setIsSceneVisible(false); // Hide the SceneContainer when minimized
  };

  // Toggle SceneContainer visibility
  const toggleSceneVisibility = () => {
    setIsSceneVisible((prev) => !prev);
  };

  // Store MapView instance (if needed for future enhancements)
  const handleMapViewLoad = (view) => {
    mapViewRef.current = view;
  };

  // Store SceneView instance (if needed for future enhancements)
  const handleSceneViewLoad = (view) => {
    sceneViewRef.current = view;
  };

  return (
    <div className="map-scene-toggle">
      <Header onToggleScene={toggleSceneVisibility} /> {/* Pass toggle function */}
      <MapContainer
        onMapViewLoad={handleMapViewLoad}
        onStationSelect={handleStationSelect}
        selectedStation={selectedStation}
      />
      <SceneContainer
        onSceneViewLoad={handleSceneViewLoad}
        selectedStation={selectedStation}
        onStationSelect={handleStationSelect}
        onSidebarMinimize={handleSidebarMinimize}
        isVisible={isSceneVisible} // Pass visibility prop
      />
      <Footer />
    </div>
  );
};

export default MapSceneToggle;

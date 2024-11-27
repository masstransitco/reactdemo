// src/components/MapSceneToggle.jsx

import React, { useState, useRef } from "react";
import MapContainer from "./Map/MapContainer";
import SceneContainer from "./Scene/SceneContainer";
import "./MapSceneToggle.css";

const MapSceneToggle = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const mapViewRef = useRef(null);
  const sceneViewRef = useRef(null);

  // Callback when a station is selected in the MapContainer
  const handleStationSelect = (station) => {
    setSelectedStation(station);
  };

  // Callback to minimize the SceneContainer sidebar
  const handleSidebarMinimize = () => {
    setSelectedStation(null);
  };

  // Store MapView instance
  const handleMapViewLoad = (view) => {
    mapViewRef.current = view;
  };

  // Store SceneView instance
  const handleSceneViewLoad = (view) => {
    sceneViewRef.current = view;
  };

  return (
    <div className="map-scene-toggle">
      <MapContainer
        onMapViewLoad={handleMapViewLoad}
        onStationSelect={handleStationSelect}
        selectedStation={selectedStation}
      />
      <SceneContainer
        onSceneViewLoad={handleSceneViewLoad}
        selectedStation={selectedStation}
        onSidebarMinimize={handleSidebarMinimize}
      />
    </div>
  );
};

export default MapSceneToggle;

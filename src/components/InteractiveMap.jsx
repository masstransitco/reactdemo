// src/components/InteractiveMap.jsx

import React, { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import DraggableMarker from "./DraggableMarker";
import StaticMarker from "./StaticMarker"; // To be created
import "leaflet/dist/leaflet.css";

const InteractiveMap = () => {
  const [carPosition, setCarPosition] = useState([34.027, -118.805]);

  const handleDragEnd = (newPos) => {
    setCarPosition([newPos.lat, newPos.lng]);
    // Additional logic for route simulation can be added here
  };

  return (
    <MapContainer
      center={carPosition}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <DraggableMarker position={carPosition} onDragEnd={handleDragEnd} />
      {/* Add StaticMarkers for stations */}
      <StaticMarker position={[34.037, -118.805]} />
      {/* Add more static markers as needed */}
    </MapContainer>
  );
};

export default InteractiveMap;

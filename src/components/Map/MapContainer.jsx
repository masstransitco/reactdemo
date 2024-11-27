
// src/components/Map/MapContainer.jsx

import React, { useRef, useState }, { useEffect, useRef } from "react";

import Map from "@arcgis/core/Map";

import MapView from "@arcgis/core/views/MapView";

import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

import "./MapContainer.css"; from './dummy';
 from './dummy';

// Import ArcGIS CSS
import "@arcgis/core/assets/esri/themes/light/main.css"; from './dummy';
 from './dummy';

const MapContainer = ({ onMapViewLoad }) => {
  const mapRef = useRef();

  useEffect(() => {
    let view;

    const initializeMap = async () => {
      const map = new Map({
        basemap: "streets-navigation-vector",
      });

      view = new MapView({
        container: mapRef.current,
        map: map,
        center: [114.1694, 22.3193], // Hong Kong coordinates
        zoom: 11, // Adjust initial zoom level
      });

      await view.when();

      // Add Stations Layer
      const stationsLayer = new FeatureLayer({
        url: "https://services.arcgis.com/your-feature-layer-url", // Replace with actual Feature Layer URL
        outFields: ["*"],
        popupTemplate: {
          title: "{StationName}", // Customize based on your data fields
          content: "{Description}", // Customize based on your data fields
        },
      });
      map.add(stationsLayer);

      // Notify parent component that MapView is loaded
      if (onMapViewLoad) {
        onMapViewLoad(view);
      }
    };

    initializeMap();

    return () => {
      if (view) {
        view.destroy();
        view = null;
      }
    };
  }, [onMapViewLoad]);

  return <div className="map-container" ref={mapRef}></div>;
};

export default MapContainer;

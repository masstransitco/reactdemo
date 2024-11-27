// src/components/Map/MapContainer.jsx

import React, { useEffect, useRef, useState } from "react";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Locate from "@arcgis/core/widgets/Locate";
import PropTypes from "prop-types";
import "./MapContainer.css";

// Import ArcGIS CSS
import "@arcgis/core/assets/esri/themes/light/main.css";

const MapContainer = ({ onMapViewLoad }) => {
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Define Hong Kong extent in WGS84
  const hongKongExtent = {
    xmin: 113.7,
    ymin: 22.15,
    xmax: 114.4,
    ymax: 22.55,
    spatialReference: { wkid: 4326 },
  };

  useEffect(() => {
    let view;

    const initializeMap = async () => {
      try {
        // Initialize WebMap with your specific Item ID
        const webMap = new WebMap({
          portalItem: {
            id: "2e977a0d176b4bb582b9d4d643dfcc4d", // Your 2D Web Map ID
          },
        });

        view = new MapView({
          container: mapRef.current,
          map: webMap,
          constraints: {
            geometry: hongKongExtent,
            rotationEnabled: false,
            minScale: 500000, // Adjust as needed
            maxScale: 1000,    // Adjust as needed
          },
          extent: hongKongExtent, // Set initial extent to Hong Kong
        });

        // Wait for the view to load
        await view.when();
        setIsLoading(false); // Map has loaded

        // Notify parent component that MapView is loaded
        if (onMapViewLoad) {
          onMapViewLoad(view);
        }

        // Add car locations layer with definition expression to load only within Hong Kong
        const carLayer = new FeatureLayer({
          url: "https://your-cartrack-api-endpoint.com/car-locations", // Replace with your actual API endpoint
          outFields: ["*"],
          popupTemplate: {
            title: "Car Location",
            content: "Car ID: {car_id}<br>Location: {location}",
          },
          // Enable clustering
          featureReduction: {
            type: "cluster",
            clusterRadius: "100px",
            popupTemplate: {
              title: "Cluster Summary",
              content: "You have {cluster_count} cars in this area.",
            },
          },
          definitionExpression: "longitude >= 113.7 AND longitude <= 114.4 AND latitude >= 22.15 AND latitude <= 22.55", // Adjust field names as per your data
        });

        webMap.add(carLayer);

        // Initialize the Locate widget
        const locateWidget = new Locate({
          view: view,
          useHeadingEnabled: false, // Disable heading
          goToOverride: function (view, options) {
            options.target.scale = 1500; // Adjust the zoom scale as needed
            return view.goTo(options.target);
          },
        });

        // Remove all existing widgets and add only the Locate widget
        view.ui.empty("top-left"); // Clear existing widgets
        view.ui.add(locateWidget, "top-left"); // Add only Geolocation widget

        // Optionally, listen for the locate event to perform additional actions
        locateWidget.on("locate", (event) => {
          console.log("User located at: ", event.position);
        });
      } catch (err) {
        console.error("Error initializing MapView:", err);
        setError("Failed to load the map. Please try again later.");
        setIsLoading(false); // Ensure loading state is false on error
      }
    };

    initializeMap();

    // Cleanup on unmount
    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [onMapViewLoad]);

  return (
    <>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div
          className={`map-container ${isLoading ? "loading" : ""}`}
          ref={mapRef}
        ></div>
      )}
    </>
  );
};

MapContainer.propTypes = {
  onMapViewLoad: PropTypes.func.isRequired,
};

export default MapContainer;

// src/components/Scene/SceneContainer.jsx

import React, { useEffect, useRef, useState } from "react";
import WebScene from "@arcgis/core/WebScene";
import SceneView from "@arcgis/core/views/SceneView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Compass from "@arcgis/core/widgets/Compass";
import PropTypes from "prop-types";
import "./SceneContainer.css";

// Import ArcGIS CSS
import "@arcgis/core/assets/esri/themes/light/main.css";

const SceneContainer = ({ onSceneViewLoad, onCameraChange }) => {
  const sceneRef = useRef(null);
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
    let cameraWatchHandle;

    const initializeScene = async () => {
      try {
        // Initialize WebScene with your specific Web Scene ID
        const webScene = new WebScene({
          portalItem: {
            id: "4304b6c3b2084330b4a2153da9fbbcf0", // Your 3D Web Scene ID
          },
        });

        // Create the SceneView
        view = new SceneView({
          container: sceneRef.current,
          map: webScene,
          constraints: {
            geometry: hongKongExtent,
            rotationEnabled: false,
            minScale: 500000, // Adjust as needed
            maxScale: 1000,    // Adjust as needed
          },
          extent: hongKongExtent, // Set initial extent to Hong Kong
          camera: {
            position: [
              114.1, // Longitude
              22.3,  // Latitude
              1000,  // Elevation in meters (closer view)
            ],
            tilt: 0,
            heading: 0,
          },
          environment: {
            lighting: {
              date: new Date(),
              directShadowsEnabled: true,
              ambientOcclusionEnabled: true,
            },
          },
        });

        // Wait for the view to load
        await view.when();
        setIsLoading(false); // Scene has loaded

        // Notify parent component that SceneView is loaded
        if (onSceneViewLoad) {
          onSceneViewLoad(view);
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

        webScene.add(carLayer);

        // Initialize the Compass widget
        const compassWidget = new Compass({
          view: view,
        });

        // Remove all existing widgets and add only the Compass widget
        view.ui.empty("top-right"); // Clear existing widgets
        view.ui.add(compassWidget, "top-right"); // Add only Compass widget

        // Handle cluster click to zoom into neighborhood level
        view.on("click", async (event) => {
          const response = await view.hitTest(event);
          const results = response.results.filter(
            (result) => result.graphic.layer === carLayer
          );

          if (results.length > 0) {
            const graphic = results[0].graphic;

            if (graphic.attributes.cluster_count) {
              // It's a cluster
              const centroid = graphic.geometry.centroid;
              view.goTo({
                center: centroid,
                zoom: view.zoom + 2, // Adjust zoom level as needed
              });
            } else {
              // It's an individual feature
              // Optionally, open a popup or perform other actions
              view.popup.open({
                title: graphic.attributes.car_id,
                content: graphic.attributes.location,
                location: graphic.geometry,
              });
            }
          }
        });

        // Debounce camera changes to optimize performance
        let debounceTimeout;
        const debounceDelay = 300; // milliseconds

        // Watch for camera changes and debounce the callback
        cameraWatchHandle = view.watch("camera", (newCamera) => {
          if (debounceTimeout) {
            clearTimeout(debounceTimeout);
          }
          debounceTimeout = setTimeout(() => {
            if (onCameraChange) {
              onCameraChange(newCamera);
            }
          }, debounceDelay);
        });
      } catch (err) {
        console.error("Error initializing SceneView:", err);
        setError("Failed to load the scene. Please try again later.");
        setIsLoading(false); // Ensure loading state is false on error
      }
    };

    initializeScene();

    // Cleanup on unmount
    return () => {
      if (view) {
        view.destroy();
      }
      if (cameraWatchHandle) {
        cameraWatchHandle.remove();
      }
    };
  }, [onSceneViewLoad, onCameraChange]);

  return (
    <>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div
          className={`scene-container ${isLoading ? "loading" : ""}`}
          ref={sceneRef}
        ></div>
      )}
    </>
  );
};

SceneContainer.propTypes = {
  onSceneViewLoad: PropTypes.func.isRequired,
  onCameraChange: PropTypes.func.isRequired,
};

export default SceneContainer;

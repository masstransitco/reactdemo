// src/components/Scene/SceneContainer.jsx

import React, { useEffect, useRef, useState } from "react";
import WebScene from "@arcgis/core/WebScene";
import SceneView from "@arcgis/core/views/SceneView";
import Locate from "@arcgis/core/widgets/Locate";
import PropTypes from "prop-types";
import "./SceneContainer.css";

// Import ArcGIS CSS
import "@arcgis/core/assets/esri/themes/light/main.css";

const SceneContainer = ({ onSceneViewLoad, onCameraChange }) => {
  const sceneRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let view;

    const initializeScene = async () => {
      try {
        const scene = new WebScene({
          portalItem: {
            id: "4304b6c3b2084330b4a2153da9fbbcf0", // Your webscene ID
          },
        });

        view = new SceneView({
          container: sceneRef.current,
          map: scene,
          camera: {
            // Replace with initial camera position [longitude, latitude, elevation]
            position: [
              -98.5795, // Example longitude
              39.8283, // Example latitude
              10000, // Example elevation in meters
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

        await view.when();

        // Notify parent component that SceneView is loaded
        if (onSceneViewLoad) {
          onSceneViewLoad(view);
        }

        // Set the extent to the country level
        view.extent = {
          xmin: -130, // Example min longitude
          ymin: 24, // Example min latitude
          xmax: -60, // Example max longitude
          ymax: 50, // Example max latitude
          spatialReference: { wkid: 4326 },
        };

        // Decrease the FOV to 15 degrees
        view.camera.fov = 15;

        // Initialize the Locate widget
        const locateWidget = new Locate({
          view: view,
          useHeadingEnabled: false, // Disable heading
          goToOverride: function (view, options) {
            options.target.scale = 1500; // Adjust the zoom scale as needed
            return view.goTo(options.target);
          },
        });

        // Add the Locate widget to the UI
        view.ui.add(locateWidget, "top-left");

        // Optionally, listen for the locate event to perform additional actions
        locateWidget.on("locate", (event) => {
          console.log("User located at: ", event.position);
        });

        // Listen for camera changes to synchronize with the map
        view.watch("camera", (newCamera) => {
          if (onCameraChange) {
            onCameraChange(newCamera);
          }
        });
      } catch (err) {
        console.error("Error initializing SceneView:", err);
        setError("Failed to load the scene. Please try again later.");
      }
    };

    initializeScene();

    // Cleanup on unmount
    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [onSceneViewLoad, onCameraChange]);

  return (
    <>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="scene-container" ref={sceneRef}></div>
      )}
    </>
  );
};

SceneContainer.propTypes = {
  onSceneViewLoad: PropTypes.func.isRequired,
  onCameraChange: PropTypes.func.isRequired,
};

export default SceneContainer;

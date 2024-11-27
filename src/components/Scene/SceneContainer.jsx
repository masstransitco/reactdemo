// src/components/Scene/SceneContainer.jsx

import React, { useEffect, useRef, useState } from "react";
import WebScene from "@arcgis/core/WebScene";
import SceneView from "@arcgis/core/views/SceneView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Locate from "@arcgis/core/widgets/Locate";
import PropTypes from "prop-types";
import "./SceneContainer.css";

// Import ArcGIS CSS
import "@arcgis/core/assets/esri/themes/light/main.css";

const SceneContainer = ({ onSceneViewLoad, onCameraChange }) => {
  const sceneRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    let view;

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
          camera: {
            position: [
              -98.5795, // Longitude
              39.8283, // Latitude
              10000, // Elevation in meters
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

        // Optionally, set the extent to the country level
        view.extent = {
          xmin: -130, // Example min longitude
          ymin: 24, // Example min latitude
          xmax: -60, // Example max longitude
          ymax: 50, // Example max latitude
          spatialReference: { wkid: 4326 },
        };

        // Decrease the Field of View (FOV) to 15 degrees for a more zoomed-in perspective
        view.camera.fov = 15;

        // Add the Locate widget
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

        // Listen for the locate event to perform additional actions
        locateWidget.on("locate", (event) => {
          console.log("User located at: ", event.position);
        });

        // Add car locations layer with clustering
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
        });

        // Add the FeatureLayer to the WebScene
        webScene.add(carLayer);

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

        // Listen for camera changes to synchronize with the map
        view.watch("camera", (newCamera) => {
          if (onCameraChange) {
            onCameraChange(newCamera);
          }
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

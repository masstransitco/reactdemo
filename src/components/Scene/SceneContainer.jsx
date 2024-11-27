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

const SceneContainer = ({
  onSceneViewLoad,
  selectedStation,
  onStationSelect,
  onSidebarMinimize,
  isVisible, // New prop to control visibility
}) => {
  const sceneRef = useRef(null);
  const viewRef = useRef(null); // To store SceneView instance
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [carLayer, setCarLayer] = useState(null); // Reference to car layer

  // Define Hong Kong extent in WGS84
  const hongKongExtent = {
    xmin: 113.7,
    ymin: 22.15,
    xmax: 114.4,
    ymax: 22.55,
    spatialReference: { wkid: 4326 },
  };

  // Initialization Effect
  useEffect(() => {
    const initializeScene = async () => {
      try {
        // Initialize WebScene with your specific Web Scene ID
        const webScene = new WebScene({
          portalItem: {
            id: "4304b6c3b2084330b4a2153da9fbbcf0", // Your 3D Web Scene ID
          },
        });

        const view = new SceneView({
          container: sceneRef.current,
          map: webScene,
          constraints: {
            geometry: hongKongExtent,
            rotationEnabled: false,
            tiltEnabled: false,
            zoomEnabled: true,
            minScale: 500000, // Adjust as needed
            maxScale: 1000, // Adjust as needed
          },
          extent: hongKongExtent, // Set initial extent to Hong Kong
          camera: {
            position: [
              114.1, // Longitude
              22.3, // Latitude
              1000, // Elevation in meters (closer view)
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

        viewRef.current = view;

        // Wait for the view to load
        await view.when();
        setIsLoading(false); // Scene has loaded

        // Notify parent component that SceneView is loaded
        if (onSceneViewLoad) {
          onSceneViewLoad(view);
        }

        // Add car locations layer with definition expression to load only within Hong Kong
        const carLayerInstance = new FeatureLayer({
          url: "https://services.arcgis.com/a66edb1852cc43a2825097835dad7a46/arcgis/rest/services/Stations/FeatureServer/0", // Replace with actual URL
          outFields: ["Station_ID", "Station_Name", "Location"], // Specify needed fields
          popupTemplate: {
            title: "Station: {Station_Name}", // Adjust field names as per data
            content: "Station ID: {Station_ID}<br>Location: {Location}",
          },
          // Enable clustering if desired
          featureReduction: {
            type: "cluster",
            clusterRadius: "100px",
            popupTemplate: {
              title: "Cluster Summary",
              content: "You have {cluster_count} stations in this area.",
            },
          },
          definitionExpression:
            "longitude >= 113.7 AND longitude <= 114.4 AND latitude >= 22.15 AND latitude <= 22.55", // Adjust field names as per your data
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-marker",
              color: "#555555", // Gray color for other stations
              outline: {
                color: "#FFFFFF",
                width: 1,
              },
              size: 6,
            },
          },
        });

        webScene.add(carLayerInstance);
        setCarLayer(carLayerInstance);

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
            (result) => result.graphic.layer === carLayerInstance
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
              // Notify parent of selection
              const stationData = {
                id: graphic.attributes.Station_ID, // Adjust field names
                name: graphic.attributes.Station_Name,
                location: graphic.geometry, // Geometry object
              };
              if (onStationSelect) {
                onStationSelect(stationData);
              }
            }
          }
        });
      } catch (err) {
        console.error("Error initializing SceneView:", err);
        setError("Failed to load the scene. Please try again later.");
        setIsLoading(false); // Ensure loading state is false on error
      }
    };

    initializeScene();

    // Cleanup Effect
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
      }
    };
  }, [onSceneViewLoad, onStationSelect]);

  // Effect to handle selectedStation changes
  useEffect(() => {
    if (!carLayer) return;

    if (selectedStation) {
      // Update renderer to highlight selected station
      carLayer.renderer = {
        type: "simple",
        symbol: {
          type: "simple-marker",
          color: "#555555", // Gray color for other stations
          outline: {
            color: "#FFFFFF",
            width: 1,
          },
          size: 6,
        },
        visualVariables: [
          {
            type: "color",
            field: "Station_ID", // Adjust field name
            stops: [
              {
                value: selectedStation.id,
                color: "blue",
              },
            ],
          },
        ],
      };

      // Highlight selected station
      carLayer
        .queryFeatures({
          where: `Station_ID = '${selectedStation.id}'`,
          outFields: ["*"],
        })
        .then((result) => {
          result.features.forEach((graphic) => {
            graphic.symbol = {
              type: "simple-marker",
              color: "blue",
              outline: {
                color: "#FFFFFF",
                width: 1,
              },
              size: 10,
            };
          });
          carLayer.refresh();
        });

      // Pan camera to selected station
      const { location } = selectedStation; // geometry object
      if (location && viewRef.current) {
        viewRef.current.goTo({
          target: location,
          zoom: 1500, // Adjust as needed
          tilt: 0,
          heading: 0,
        });
      }
    } else {
      // Reset renderer to default
      carLayer.renderer = {
        type: "simple",
        symbol: {
          type: "simple-marker",
          color: "#555555", // Gray color for stations
          outline: {
            color: "#FFFFFF",
            width: 1,
          },
          size: 6,
        },
      };

      // Reset symbols of all graphics
      carLayer
        .queryFeatures({
          where: "1=1",
          outFields: ["*"],
        })
        .then((result) => {
          result.features.forEach((graphic) => {
            graphic.symbol = {
              type: "simple-marker",
              color: "#555555",
              outline: {
                color: "#FFFFFF",
                width: 1,
              },
              size: 6,
            };
          });
          carLayer.refresh();
        });
    }
  }, [selectedStation, carLayer]);

  return (
    <div className={`scene-container ${isVisible ? "visible" : "hidden"}`}>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div
          className={`scene-view ${isLoading ? "loading" : ""}`}
          ref={sceneRef}
        ></div>
      )}
      {selectedStation && (
        <div className="sidebar">
          <button className="minimize-button" onClick={onSidebarMinimize}>
            &times;
          </button>
          <div className="station-details">
            <h2>{selectedStation.name}</h2>
            <p>Station ID: {selectedStation.id}</p>
            {/* Add more details as needed */}
          </div>
        </div>
      )}
    </div>
  );
};

// Define PropTypes outside the component
SceneContainer.propTypes = {
  onSceneViewLoad: PropTypes.func.isRequired,
  onStationSelect: PropTypes.func, // Optional
  selectedStation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired, // Geometry object
  }),
  onSidebarMinimize: PropTypes.func.isRequired,
  isVisible: PropTypes.bool.isRequired, // New prop
};

export default SceneContainer;

// src/components/Map/MapContainer.jsx

import React, { useEffect, useRef, useState, useContext } from "react";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import PropTypes from "prop-types";
import "./MapContainer.css";

// Import ArcGIS CSS
import "@arcgis/core/assets/esri/themes/light/main.css";

import { AppContext } from "../../context/AppContext"; // Import context

// Define Hong Kong extent outside the component to prevent re-creation on every render
const HONG_KONG_EXTENT = {
  xmin: 113.7,
  ymin: 22.15,
  xmax: 114.4,
  ymax: 22.55,
  spatialReference: { wkid: 4326 },
};

const MapContainer = ({ onMapViewLoad }) => {
  const mapRef = useRef(null);
  const viewRef = useRef(null); // To store MapView instance
  const { selectedStation, setSelectedStation } = useContext(AppContext);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [userLocation, setUserLocation] = useState(null); // State to store user location

  useEffect(() => {
    let view;

    const initializeMap = async () => {
      try {
        // Initialize WebMap with the provided 2D Web Map ID
        const webMap = new WebMap({
          portalItem: {
            id: "2e977a0d176b4bb582b9d4d643dfcc4d", // 2D Map ID
          },
        });

        view = new MapView({
          container: mapRef.current,
          map: webMap,
          constraints: {
            geometry: HONG_KONG_EXTENT, // Ensure this is a valid Extent object
            rotationEnabled: false,
            minScale: 500000, // Adjust as needed
            maxScale: 1000, // Adjust as needed
          },
          extent: HONG_KONG_EXTENT, // Set initial extent to Hong Kong
        });

        viewRef.current = view;

        // Wait for the view to load
        await view.when();
        setIsLoading(false); // Map has loaded

        // Notify parent component that MapView is loaded
        if (onMapViewLoad) {
          onMapViewLoad(view);
        }

        // Create a GraphicsLayer for user location
        const userLayer = new GraphicsLayer();
        webMap.add(userLayer);

        // Store the userLayer reference for later use
        viewRef.current.userLayer = userLayer;

        // Add click event to handle station selection
        view.on("click", (event) => {
          view.hitTest(event).then((response) => {
            const results = response.results;
            if (results.length > 0) {
              const graphic = results.filter(
                (result) => result.graphic.layer.type === "feature"
              )[0]?.graphic;
              if (graphic) {
                const station = {
                  id: graphic.attributes.ID, // Adjust based on your attribute names
                  name: graphic.attributes.Name, // Adjust based on your attribute names
                  location: graphic.geometry,
                };
                setSelectedStation(station);
              }
            }
          });
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
  }, [onMapViewLoad, setSelectedStation]);

  useEffect(() => {
    if (!viewRef.current) return;

    if (selectedStation) {
      // Pan camera to selected station
      const { location } = selectedStation; // geometry object
      if (location && viewRef.current) {
        viewRef.current
          .goTo({
            target: location,
            zoom: 1500, // Adjust as needed
            tilt: 0,
            heading: 0,
          })
          .then(() => {
            console.log(`Camera moved to station: ${selectedStation.name}`);
          })
          .catch((err) => {
            console.error("Error panning to selected station:", err);
          });
      }
    }

    // Allow camera movement in MapContainer
    viewRef.current.constraints.rotationEnabled = true;
    viewRef.current.constraints.tiltEnabled = true;
    viewRef.current.constraints.panEnabled = true;
    viewRef.current.constraints.zoomEnabled = true;
  }, [selectedStation]);

  // Function to handle user location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userPoint = {
          type: "point",
          longitude: longitude,
          latitude: latitude,
        };
        setUserLocation(userPoint);

        // Create a graphic for the user's location
        const userGraphic = new Graphic({
          geometry: userPoint,
          symbol: {
            type: "simple-marker",
            color: [46, 204, 113], // Green color
            outline: {
              color: [255, 255, 255],
              width: 2,
            },
            size: "12px",
          },
        });

        // Clear previous user location graphics
        viewRef.current.userLayer.graphics.removeAll();

        // Add the new user location graphic
        viewRef.current.userLayer.add(userGraphic);

        // Pan and zoom to user's location
        viewRef.current
          .goTo({
            target: userPoint,
            zoom: 1500, // Adjust as needed
          })
          .then(() => {
            console.log("Camera moved to user location.");
          })
          .catch((err) => {
            console.error("Error panning to user location:", err);
          });
      },
      (error) => {
        console.error("Error obtaining geolocation:", error);
        alert("Unable to retrieve your location.");
      }
    );
  };

  return (
    <>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className={`map-container ${isLoading ? "loading" : ""}`}>
          <button
            className="custom-locate-button"
            onClick={handleLocateMe}
            aria-label="Locate Me"
          >
            📍
          </button>
          <div ref={mapRef} style={{ height: "100%", width: "100%" }}></div>
        </div>
      )}
    </>
  );
};

MapContainer.propTypes = {
  onMapViewLoad: PropTypes.func.isRequired,
};

export default MapContainer;

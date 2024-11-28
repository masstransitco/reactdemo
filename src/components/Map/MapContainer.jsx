// src/components/Map/MapContainer.jsx

import React, { useEffect, useRef, useState, useContext } from "react";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import Locate from "@arcgis/core/widgets/Locate"; // Import Locate widget
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
        view.ui.add(locateWidget, "top-left"); // Add only Locate widget

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

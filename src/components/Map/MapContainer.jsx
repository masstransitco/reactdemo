// src/components/Map/MapContainer.jsx

import React, { useEffect, useRef, useState } from "react"; // Added useState
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
  const [isLoading, setIsLoading] = useState(true); // Moved inside the component

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
          // Optionally, set additional properties like center and zoom
        });

        // Wait for the view to load
        await view.when();
        setIsLoading(false); // Map has loaded

        // Notify parent component that MapView is loaded
        if (onMapViewLoad) {
          onMapViewLoad(view);
        }

        // Optionally, set the extent to the country level
        view.extent = {
          xmin: -130,
          ymin: 24,
          xmax: -60,
          ymax: 50,
          spatialReference: { wkid: 4326 },
        };

        // Add car locations layer
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

        webMap.add(carLayer);

        // Initialize the Locate widget
        const locateWidget = new Locate({
          view: view,
          useHeadingEnabled: false,
          goToOverride: function (view, options) {
            options.target.scale = 1500;
            return view.goTo(options.target);
          },
        });

        // Add the Locate widget to the UI
        view.ui.add(locateWidget, "top-left");

        // Optionally, listen for the locate event to perform additional actions
        locateWidget.on("locate", (event) => {
          console.log("User located at: ", event.position);
        });

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

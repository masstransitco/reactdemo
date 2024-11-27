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

const MapContainer = ({ onMapViewLoad, onStationSelect, selectedStation }) => {
  const mapRef = useRef(null);
  const viewRef = useRef(null); // To store MapView instance
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
            maxScale: 1000, // Adjust as needed
          },
          extent: hongKongExtent, // Set initial extent to Hong Kong
        });

        viewRef.current = view;

        // Wait for the view to load
        await view.when();
        setIsLoading(false); // Map has loaded

        // Notify parent component that MapView is loaded
        if (onMapViewLoad) {
          onMapViewLoad(view);
        }

        // Add car locations layer with definition expression to load only within Hong Kong
        const carLayerInstance = new FeatureLayer({
          url: "https://services.arcgis.com/a66edb1852cc43a2825097835dad7a46/arcgis/rest/services/Stations/FeatureServer", // Replace with actual URL
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
              color: "#FF0000", // Default color for stations
              outline: {
                color: "#FFFFFF",
                width: 1,
              },
              size: 8,
            },
          },
        });

        webMap.add(carLayerInstance);
        setCarLayer(carLayerInstance);

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
  }, [onMapViewLoad, onStationSelect]);

  useEffect(() => {
    if (!carLayer || !viewRef.current) return;

    const view = viewRef.current;

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
      if (location && view) {
        view.goTo({
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
          color: "#FF0000", // Default color for stations
          outline: {
            color: "#000000",
            width: 1,
          },
          size: 8,
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
              color: "#FF0000",
              outline: {
                color: "#FFFFFF",
                width: 1,
              },
              size: 8,
            };
          });
          carLayer.refresh();
        });
    }
  }, [selectedStation, carLayer]);

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
  onStationSelect: PropTypes.func.isRequired,
  selectedStation: PropTypes.object,
};

export default MapContainer;

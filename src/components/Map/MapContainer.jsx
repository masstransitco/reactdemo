// src/components/Map/MapContainer.jsx

import React, { useEffect, useRef, useState, useContext } from "react";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Locate from "@arcgis/core/widgets/Locate";
import Search from "@arcgis/core/widgets/Search";
import PropTypes from "prop-types";
import "./MapContainer.css";

// Import ArcGIS CSS
import "@arcgis/core/assets/esri/themes/light/main.css";

import { AppContext } from "../../context/AppContext"; // Import context

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
  const { setSelectedStation, setMapView } = useContext(AppContext); // Destructure context methods
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [userLocation, setUserLocation] = useState(null); // State to store user location
  const [address, setAddress] = useState(""); // Address input state

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
            geometry: HONG_KONG_EXTENT,
            rotationEnabled: false,
            minScale: 500000,
            maxScale: 1000,
          },
          extent: HONG_KONG_EXTENT,
          ui: {
            components: ["zoom", "compass", "attribution"],
          },
        });

        viewRef.current = view;

        // Add default Locate button
        const locateBtn = new Locate({
          view: view,
          graphicEnabled: false,
          useHeadingEnabled: false,
          goToOverride: (view, options) => {
            options.target.scale = 1500;
            return view.goTo(options.target);
          },
        });

        view.ui.add(locateBtn, { position: "bottom-left" });

        // Add search widget
        const searchWidget = new Search({
          view: view,
        });

        view.ui.add(searchWidget, { position: "top-right" });

        // Wait for the view to load
        await view.when();
        setIsLoading(false);

        // Notify parent component
        if (onMapViewLoad) {
          onMapViewLoad(view);
        }

        // Provide the MapView to context
        setMapView(view);

        // Create a GraphicsLayer for user location and search markers
        const userLayer = new GraphicsLayer();
        webMap.add(userLayer);
        viewRef.current.userLayer = userLayer;

        // Add click event to handle station selection
        view.on("click", (event) => {
          view.hitTest(event).then((response) => {
            const results = response.results;
            if (results.length > 0) {
              const graphic = results.find(
                (result) => result.graphic.layer.type === "feature"
              )?.graphic;

              if (graphic) {
                const station = {
                  id: graphic.attributes.ID,
                  name: graphic.attributes.Name,
                  location: graphic.geometry,
                };
                setSelectedStation(station);
              }
            }
          });
        });
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to load the map.");
      }
    };

    initializeMap();

    // Cleanup on unmount
    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [onMapViewLoad, setSelectedStation, setMapView]);

  useEffect(() => {
    if (!viewRef.current) return;

    if (userLocation) {
      viewRef.current
        .goTo({ target: userLocation, zoom: 1500 })
        .catch((err) => {
          console.error("Error panning to user location:", err);
        });
    }

    // Allow camera movement
    viewRef.current.constraints.rotationEnabled = true;
    viewRef.current.constraints.tiltEnabled = true;
    viewRef.current.constraints.panEnabled = true;
    viewRef.current.constraints.zoomEnabled = true;
  }, [userLocation]);

  const handleAddressSearch = async (e) => {
    e.preventDefault();
    if (!address) return;

    try {
      const response = await geocoding.addressToLocations({
        address: address,
        outFields: ["*"],
      });

      if (response.candidates.length > 0) {
        const bestCandidate = response.candidates[0];
        const { location } = bestCandidate;

        viewRef.current.goTo({ target: location, zoom: 1500 });

        const searchGraphic = new Graphic({
          geometry: location,
          symbol: {
            type: "simple-marker",
            color: [255, 0, 0],
            outline: {
              color: [255, 255, 255],
              width: 2,
            },
            size: "12px",
          },
        });

        viewRef.current.userLayer.graphics.removeAll();
        viewRef.current.userLayer.add(searchGraphic);
      } else {
        alert("No results found for the entered address.");
      }
    } catch (err) {
      console.error("Error during geocoding:", err);
      alert("An error occurred while searching for the address.");
    }
  };

  return (
    <>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className={`map-container ${isLoading ? "loading" : ""}`}>
          <form className="address-form" onSubmit={handleAddressSearch}>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              aria-label="Address"
              required
            />
            <button type="submit">Find Station Near Me</button>
          </form>
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

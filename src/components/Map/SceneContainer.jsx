// src/components/Scene/SceneContainer.jsx

import React, { useEffect, useRef, useState, useContext } from "react";
import WebScene from "@arcgis/core/WebScene";
import SceneView from "@arcgis/core/views/SceneView";
import Compass from "@arcgis/core/widgets/Compass";
import PropTypes from "prop-types";
import "./SceneContainer.css";
import { AppContext } from "../../context/AppContext"; // Import context

// Import ArcGIS CSS
import "@arcgis/core/assets/esri/themes/light/main.css";

const SceneContainer = ({
  onSceneViewLoad,
  onSidebarMinimize,
  isVisible, // Controls visibility
}) => {
  const sceneRef = useRef(null);
  const viewRef = useRef(null); // To store SceneView instance
  const { selectedStation } = useContext(AppContext); // Access selectedStation from context
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Define Hong Kong extent in WGS84 as an actual Extent object
  const HONG_KONG_EXTENT = {
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
        // Initialize WebScene with the provided 3D Web Scene ID
        const webScene = new WebScene({
          portalItem: {
            id: "4304b6c3b2084330b4a2153da9fbbcf0", // 3D Scene ID
          },
        });

        const view = new SceneView({
          container: sceneRef.current,
          map: webScene,
          constraints: {
            geometry: HONG_KONG_EXTENT, // Use the Extent object
            rotationEnabled: false,
            tiltEnabled: false,
            zoomEnabled: true,
            minScale: 500000, // Adjust as needed
            maxScale: 1000, // Adjust as needed
          },
          extent: HONG_KONG_EXTENT, // Set initial extent to Hong Kong
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

        // Initialize the Compass widget
        const compassWidget = new Compass({
          view: view,
        });

        // Remove all existing widgets and add only the Compass widget
        view.ui.empty("top-right"); // Clear existing widgets
        view.ui.add(compassWidget, "top-right"); // Add only Compass widget

        // Manage slides after the WebScene has loaded
        manageSlides(view, webScene);
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
  }, [onSceneViewLoad]);

  // Function to manage slides
  const manageSlides = (view, webScene) => {
    const slides = webScene.presentation.slides;

    // Log all slides
    slides.forEach((slide, index) => {
      console.log(`Slide ${index + 1}: ${slide.title.text}`);
    });

    if (slides.length > 0) {
      // Apply "Slide 1" as the initial view
      slides
        .getItemAt(0)
        .applyTo(view)
        .then(() => {
          console.log("Camera moved to Slide 1.");
        })
        .catch((err) => {
          console.error("Error applying Slide 1:", err);
        });
    } else {
      console.warn("No slides found in the WebScene.");
    }
  };

  // Function to navigate to a specific slide by index
  const goToSlide = (slideIndex) => {
    const slides = viewRef.current.map.presentation.slides;
    const slide = slides.getItemAt(slideIndex);
    if (slide) {
      slide
        .applyTo(viewRef.current)
        .then(() => {
          console.log(`Camera moved to Slide: ${slide.title.text}`);
          setCurrentSlideIndex(slideIndex); // Update current slide index
        })
        .catch((err) => {
          console.error(`Error applying Slide ${slideIndex + 1}:`, err);
        });
    } else {
      console.error("Slide index out of bounds.");
    }
  };

  // Function to navigate to the next slide
  const nextSlide = () => {
    const slides = viewRef.current.map.presentation.slides;
    if (currentSlideIndex < slides.length - 1) {
      goToSlide(currentSlideIndex + 1);
    } else {
      console.log("Already on the last slide.");
    }
  };

  // Function to navigate to the previous slide
  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    } else {
      console.log("Already on the first slide.");
    }
  };

  // State to track current slide index
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Effect to handle selectedStation changes
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

    // Lock camera movement and navigation
    viewRef.current.constraints.rotationEnabled = false;
    viewRef.current.constraints.tiltEnabled = false;
    viewRef.current.constraints.panEnabled = false;
    viewRef.current.constraints.zoomEnabled = false;
  }, [selectedStation]);

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
          <button
            className="minimize-button"
            onClick={onSidebarMinimize}
            aria-label="Minimize Sidebar"
          >
            &times;
          </button>
          <div className="station-details">
            <h2>{selectedStation.name}</h2>
            <p>Station ID: {selectedStation.id}</p>
            {/* Add more details as needed */}
          </div>
        </div>
      )}
      {/* Optional Slide Navigation Controls */}
      {isVisible && (
        <div className="slide-navigation">
          <button
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            aria-label="Previous Slide"
          >
            Previous Slide
          </button>
          <button
            onClick={nextSlide}
            disabled={
              currentSlideIndex ===
              (viewRef.current?.map.presentation.slides.length || 1) - 1
            }
            aria-label="Next Slide"
          >
            Next Slide
          </button>
        </div>
      )}
    </div>
  );
};

// Define PropTypes outside the component
SceneContainer.propTypes = {
  onSceneViewLoad: PropTypes.func.isRequired,
  onSidebarMinimize: PropTypes.func.isRequired,
  isVisible: PropTypes.bool.isRequired, // New prop to control visibility
};

export default SceneContainer;

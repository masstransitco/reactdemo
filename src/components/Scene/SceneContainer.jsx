
// src/components/Scene/SceneContainer.jsx

import React, { useRef, useState }, { useEffect, useRef } from "react";

import WebScene from "@arcgis/core/WebScene";

import SceneView from "@arcgis/core/views/SceneView";

import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

import "./SceneContainer.css"; from './dummy';
 from './dummy';

const SceneContainer = ({ onSceneViewLoad, synchronizeWithMapView }) => {
  const sceneRef = useRef();

  useEffect(() => {
    let view;

    const initializeScene = async () => {
      const scene = new WebScene({
        basemap: "streets-navigation-vector", // Matches the 2D map basemap
      });

      view = new SceneView({
        container: sceneRef.current,
        map: scene,
        camera: {
          position: [114.1694, 22.3193, 500], // Hong Kong coordinates with elevation
          tilt: 45,
        },
      });

      await view.when();

      // Add Stations Layer
      const stationsLayer = new FeatureLayer({
        url: "https://services.arcgis.com/your-feature-layer-url", // Replace with actual Feature Layer URL
        outFields: ["*"],
        popupTemplate: {
          title: "{StationName}", // Customize based on your data fields
          content: "{Description}", // Customize based on your data fields
        },
      });
      scene.add(stationsLayer);

      // Synchronize camera with MapView
      if (synchronizeWithMapView) {
        view.watch("camera", (camera) => {
          synchronizeWithMapView(camera);
        });
      }

      // Notify parent component that SceneView is loaded
      if (onSceneViewLoad) {
        onSceneViewLoad(view);
      }
    };

    initializeScene();

    return () => {
      if (view) {
        view.destroy();
        view = null;
      }
    };
  }, [onSceneViewLoad, synchronizeWithMapView]);

  return <div className="scene-container" ref={sceneRef}></div>;
};

export default SceneContainer;

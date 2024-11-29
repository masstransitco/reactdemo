// src/components/Header/Header.jsx

import React, { useContext } from "react";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";
import "./Header.css";
import { AppContext } from "../../context/AppContext";
import { AuthContext } from "../../context/AuthContext";
import GoogleSignIn from "../GoogleSignIn";
import { loadModules } from "@esri-loader";

const Header = () => {
  const { currentMarkerType, setCurrentMarkerType, mapView } =
    useContext(AppContext);
  const { user, logout } = useContext(AuthContext);

  const handleToggle = async () => {
    const newType = currentMarkerType === "Cars" ? "Stations" : "Cars";
    setCurrentMarkerType(newType);

    if (!mapView) {
      console.warn("MapView is not available.");
      return;
    }

    try {
      const [FeatureLayer] = await loadModules(["esri/layers/FeatureLayer"]);

      // Define the feature layer URLs or portal items
      const layerInfo = {
        Cars: {
          url: "https://services.arcgis.com/your_org_id/arcgis/rest/services/Cars/FeatureServer/0", // Replace with actual URL
        },
        Stations: {
          url: "https://services.arcgis.com/your_org_id/arcgis/rest/services/Stations/FeatureServer/0", // Replace with actual URL
        },
      };

      // Remove existing feature layers
      mapView.map.layers.forEach((layer) => {
        if (layer.type === "feature") {
          mapView.map.remove(layer);
        }
      });

      // Add the selected feature layer
      const selectedLayerInfo = layerInfo[newType];
      if (selectedLayerInfo) {
        const featureLayer = new FeatureLayer({
          url: selectedLayerInfo.url,
          outFields: ["*"],
        });
        mapView.map.add(featureLayer);
      }
    } catch (error) {
      console.error("Error toggling feature layers:", error);
    }
  };

  return (
    <header className="app-header">
      <ToggleSwitch
        isOn={currentMarkerType === "Stations"}
        handleToggle={handleToggle}
      />
      {user ? (
        <div className="user-section">
          <div className="user-avatar">
            <img src={user.photoURL} alt="User Avatar" />
          </div>
          {/* Implement Dropdown here as previously */}
          {/* Example Logout Button */}
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <GoogleSignIn />
      )}
    </header>
  );
};

export default Header;

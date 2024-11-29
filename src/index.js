// src/index.js

import React from "react";
import ReactDOM from "react-dom/client"; // Correct import for React 18+
import App from "./App";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";

// Import Global CSS
import "./styles/globals.css";
import "./styles/App.css";

// Import ArcGIS CSS
import "@arcgis/core/assets/esri/themes/light/main.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element with id 'root'.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthProvider>
  </React.StrictMode>
);

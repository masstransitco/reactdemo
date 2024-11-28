// src/index.js

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AppContext } from "./context/AppContext";

ReactDOM.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// Import Global CSS
import "./styles/globals.css";
import "./App.css";

// Import ArcGIS CSS
import "@arcgis/core/assets/esri/themes/light/main.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element with id 'root'.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AppContext>
      <App />
    </AppContext>
  </React.StrictMode>
);

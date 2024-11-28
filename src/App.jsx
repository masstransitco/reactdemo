// src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import NotFound from "./components/NotFound";
import MapSceneToggle from "./components/Map/MapSceneToggle";
import "./app.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Home>
              <MapSceneToggle />
            </Home>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

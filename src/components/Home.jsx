// src/components/Home.jsx

import React from "react";
// Removed Header and Footer imports
import "./Home.css"; // Ensure this file exists for additional styles if needed

const Home = ({ children }) => {
  return (
    <div className="home-container">
      <main>{children}</main>
    </div>
  );
};

export default Home;

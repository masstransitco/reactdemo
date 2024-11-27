// src/components/Footer/Footer.jsx

import React, { useEffect, useState } from "react";
import "./Footer.css";

const Footer = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");

  useEffect(() => {
    // Fetch vehicle options dynamically.
    // Replace this with an actual API call if necessary.
    const fetchVehicles = async () => {
      // Example static data. Replace with API call if needed.
      const vehicleData = [
        { id: 1, name: "Vehicle A" },
        { id: 2, name: "Vehicle B" },
        { id: 3, name: "Vehicle C" },
      ];
      setVehicles(vehicleData);
    };

    fetchVehicles();
  }, []);

  const handleVehicleChange = (event) => {
    const vehicleId = event.target.value;
    setSelectedVehicle(vehicleId);
    // Implement additional logic based on selected vehicle
    console.log(`Selected Vehicle ID: ${vehicleId}`);
  };

  const handleLock = () => {
    // Implement lock functionality
    console.log("Lock button clicked");
  };

  const handleUnlock = () => {
    // Implement unlock functionality
    console.log("Unlock button clicked");
  };

  return (
    <footer className="footer">
      {/* Logo */}
      <img src="/logo.png" alt="Logo" className="footer-logo" />

      {/* Vehicle Selector */}
      <div className="dropdown-container">
        <label htmlFor="vehicleSelector" className="visually-hidden">
          Select a Vehicle
        </label>
        <select
          id="vehicleSelector"
          name="vehicleSelector"
          value={selectedVehicle}
          onChange={handleVehicleChange}
        >
          <option value="">-- Select a Vehicle --</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lock and Unlock Buttons */}
      <div className="lock-buttons">
        <button className="lock-btn" onClick={handleLock}>
          Lock
        </button>
        <button className="unlock-btn" onClick={handleUnlock}>
          Unlock
        </button>
      </div>
    </footer>
  );
};

export default Footer;

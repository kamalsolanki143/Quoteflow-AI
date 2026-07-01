import React, { useState } from "react";

/**
 * Navbar Component
 * Renders the top navigation bar matching the dark navy style in the mockups.
 * 
 * Props:
 *  - healthStatus: "checking" | "healthy" | "offline"
 */
export default function Navbar({ healthStatus }) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = () => {
    if (healthStatus === "healthy") return "#4CAF50"; // Green
    if (healthStatus === "offline") return "#F44336"; // Red
    return "#FFC107"; // Yellow/Checking
  };

  const getStatusText = () => {
    if (healthStatus === "healthy") return "API Online";
    if (healthStatus === "offline") return "API Offline";
    return "Checking API...";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="#" className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          QuoteFlow AI
        </a>

        {/* Hamburger button for mobile responsiveness */}
        <button 
          className="navbar-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="navbar-icon-bar"></span>
          <span className="navbar-icon-bar"></span>
          <span className="navbar-icon-bar"></span>
        </button>

        <div className={`navbar-menu-wrapper ${isOpen ? "open" : ""}`}>
          <ul className="navbar-links">
            <li>
              <a href="#" className="navbar-link" onClick={() => setIsOpen(false)}>
                Home
              </a>
            </li>
            <li>
              <a href="#workflow" className="navbar-link" onClick={() => setIsOpen(false)}>
                Workflow
              </a>
            </li>
            <li>
              <a href="#upload" className="navbar-link" onClick={() => setIsOpen(false)}>
                Upload
              </a>
            </li>
            <li>
              <a href="#inventory" className="navbar-link" onClick={() => setIsOpen(false)}>
                Dashboard
              </a>
            </li>
            <li>
              <a href="#footer" className="navbar-link" onClick={() => setIsOpen(false)}>
                About
              </a>
            </li>
          </ul>

          {/* Health Status Indicator (retained from original functionality) */}
          <div className="navbar-status">
            <span 
              className="navbar-status-dot" 
              style={{ 
                backgroundColor: getStatusColor(),
                boxShadow: `0 0 6px ${getStatusColor()}` 
              }} 
            />
            <span className="navbar-status-text" style={{ color: getStatusColor() }}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

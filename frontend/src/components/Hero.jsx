import React from "react";

/**
 * Hero Component
 * Renders the hero header block matching the approved landing page design.
 */
export default function Hero() {
  const handleScrollToUpload = (e) => {
    e.preventDefault();
    const element = document.getElementById("upload");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero">
      <div className="hero-container">
        {/* Badge */}
        <div className="hero-badge">
          ✦ AI-POWERED AUTOMATION ENGINE
        </div>

        {/* Heading */}
        <h1 className="hero-title">
          Transform Messy RFQs into <br />
          <span className="hero-title-accent">Automated Quotations</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          An intelligent, AI-powered automation engine that instantly parses
          customer RFQ PDFs, verifies warehouse inventory levels, and generates
          professional quotes.
        </p>

        {/* Call to Action Button */}
        <a 
          href="#upload" 
          className="hero-button" 
          onClick={handleScrollToUpload}
        >
          Automate Now
        </a>
      </div>
    </section>
  );
}

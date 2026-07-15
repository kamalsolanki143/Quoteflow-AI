import React from 'react';
import './Hero.css';

/**
 * Hero Component
 * Renders the main marketing landing area with action CTAs.
 */
const Hero = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="home" className="quoteflow-hero-wrapper">
      <div className="quoteflow-hero-container">
        {/* Badge Tagline */}
        <div className="hero-tag-badge">
          <span>FlowZint AI Hackathon 2026</span>
        </div>

        {/* Heading */}
        <h1 className="hero-headline">
          RFQ to Quote, <br />
          <span className="gradient-text">Automated by AI</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtext">
          QuoteFlow AI automatically converts your Request For Quotation documents
          into professional, accurate quotations in seconds. Powered by Gemini AI,
          real-time inventory verification, and intelligent pricing.
        </p>

        {/* Call to Actions */}
        <div className="hero-actions">
          <button
            className="btn btn-primary hero-btn-main"
            onClick={() => scrollToSection('upload')}
          >
            Upload RFQ
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </button>

          <button
            className="btn btn-secondary hero-btn-sub"
            onClick={() => scrollToSection('inventory')}
          >
            Explore Inventory
          </button>
        </div>

        {/* Subtle Decorative Dashboard Mockup Graphic */}
        <div className="hero-preview-wrapper">
          <div className="preview-header">
            <span className="preview-dot"></span>
            <span className="preview-dot"></span>
            <span className="preview-dot"></span>
            <span className="preview-title">quoteflow-console.io</span>
          </div>
          <div className="preview-body">
            <div className="preview-sidebar">
              <div className="sidebar-line long"></div>
              <div className="sidebar-line"></div>
              <div className="sidebar-line"></div>
              <div className="sidebar-line"></div>
            </div>
            <div className="preview-content">
              <div className="content-row">
                <div className="content-box"></div>
                <div className="content-box"></div>
                <div className="content-box"></div>
              </div>
              <div className="content-main-box">
                <div className="main-box-line header"></div>
                <div className="main-box-line long"></div>
                <div className="main-box-line"></div>
                <div className="main-box-line"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

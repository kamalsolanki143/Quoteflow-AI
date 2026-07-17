import React, { useState, useEffect } from 'react';
import './Navbar.css';

/**
 * Navbar Component
 * Renders a premium corporate header with responsiveness and API health checks.
 *
 * Props:
 *  - healthStatus: 'checking' | 'healthy' | 'offline'
 */
const Navbar = ({ healthStatus = 'checking' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('Home');

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Upload RFQ', href: '#upload' },
    { name: 'Inventory Catalog', href: '#inventory' },
    { name: 'Quotation Portal', href: '#quote' },
    { name: 'Workflow', href: '#workflow' }
  ];

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = (name, href) => {
    setActiveLink(name);
    setIsMenuOpen(false);
    
    // Smooth scroll for anchors
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getStatusDetails = () => {
    switch (healthStatus) {
      case 'Online':
        return { text: 'API Online', class: 'status-healthy' };
      case 'Offline':
        return { text: 'API Offline', class: 'status-offline' };
      default:
        return { text: 'Checking API...', class: 'status-checking' };
    }
  };

  const status = getStatusDetails();

  return (
    <header className="quoteflow-navbar-wrapper">
      <div className="quoteflow-navbar-container">
        {/* Left Section: Logo & Name */}
        <div className="quoteflow-navbar-left">
          <a 
            href="#home" 
            className="quoteflow-logo-link" 
            aria-label="QuoteFlow AI Home"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('Home', '#home');
            }}
          >
            <div className="quoteflow-logo-icon-wrapper">
              <svg 
                className="quoteflow-logo-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="var(--primary)" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="quoteflow-project-name">
              QuoteFlow <span className="logo-accent">AI</span>
            </span>
          </a>
        </div>

        {/* Middle Section: Desktop Navigation */}
        <nav className="quoteflow-navbar-middle" aria-label="Main Navigation">
          <ul className="quoteflow-nav-links">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`quoteflow-nav-item ${activeLink === link.name ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.name, link.href);
                  }}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Section: Health Status & Hamburger */}
        <div className="quoteflow-navbar-right">
          {/* API Status Indicator */}
          <div className={`quoteflow-health-badge ${status.class}`} title="FastAPI Backend Health Status">
            <span className="status-dot"></span>
            <span className="status-text">{status.text}</span>
          </div>

          <button 
            className="quoteflow-cta-btn" 
            aria-label="Start Demo"
            onClick={() => handleLinkClick('Upload RFQ', '#upload')}
          >
            Get Started
          </button>
          
          {/* Mobile Hamburger Menu Toggle */}
          <button 
            className={`quoteflow-hamburger ${isMenuOpen ? 'is-open' : ''}`}
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
            aria-controls="quoteflow-mobile-drawer"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>

      {/* Animated Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="quoteflow-drawer-overlay is-visible" 
          onClick={toggleMenu}
        />
      )}

      {/* Animated Mobile Drawer */}
      <div 
        id="quoteflow-mobile-drawer"
        className={`quoteflow-mobile-drawer ${isMenuOpen ? 'is-open' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        <nav className="quoteflow-mobile-nav" aria-label="Mobile Navigation">
          <ul className="quoteflow-mobile-links">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`quoteflow-mobile-item ${activeLink === link.name ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.name, link.href);
                  }}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          
          <div className="quoteflow-mobile-footer">
            <div className={`quoteflow-health-badge mobile-badge ${status.class}`}>
              <span className="status-dot"></span>
              <span className="status-text">{status.text}</span>
            </div>
            
            <button 
              className="quoteflow-cta-btn mobile-fullwidth"
              tabIndex={isMenuOpen ? 0 : -1}
              onClick={() => handleLinkClick('Upload RFQ', '#upload')}
            >
              Get Started
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

import React from 'react';
import './FeatureCard.css';

/**
 * FeatureCard Component
 * Renders an interactive feature card with standard corporate styling and hover micro-animations.
 *
 * Props:
 *  - icon: string (emoji/unicode) or React element
 *  - title: string
 *  - desc: string
 */
const FeatureCard = ({ icon, title, desc }) => {
  return (
    <div className="card feature-card-wrapper card-hover">
      {/* Icon Badge Container */}
      <div className="feature-card-icon-wrapper">
        <span className="feature-card-icon" aria-hidden="true">
          {icon}
        </span>
      </div>
      
      {/* Content */}
      <h3 className="feature-card-title">{title}</h3>
      <p className="feature-card-desc">{desc}</p>
    </div>
  );
};

export default FeatureCard;

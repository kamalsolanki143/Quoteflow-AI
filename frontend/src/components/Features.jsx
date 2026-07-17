import React from 'react';
import FeatureCard from './FeatureCard';
import './Features.css';

/**
 * Features Component
 * Displays a curated grid of the platform's core technical and product advantages.
 */
const Features = () => {
  const featuresList = [
    {
      icon: '🤖',
      title: 'Gemini AI Extraction',
      desc: 'Instantly reads and parses unstructured product descriptions, sizes, and quantity specifications from uploaded PDFs or raw text sheets.'
    },
    {
      icon: '📦',
      title: 'Inventory Validation',
      desc: 'Automatically checks extracted RFQ items against actual live database records to verify stock availability and flag partial fulfillments.'
    },
    {
      icon: '💰',
      title: 'Intelligent Pricing',
      desc: 'Applies volume discounts, matches unit rates, and handles tax computations (like 18% GST) to output complete, error-free sub-totals.'
    },
    {
      icon: '✅',
      title: 'Manager Approval Hub',
      desc: 'Integrates a professional dashboard for procurement leads to review line-item detail and dispatch official quotation documents.'
    },
    {
      icon: '⚡',
      title: 'FastAPI High-Speed Sync',
      desc: 'Guarantees sub-2-second end-to-end extraction and processing times, driven by asynchronous Python APIs and lightweight endpoints.'
    },
    {
      icon: '📱',
      title: 'Fully Responsive Platform',
      desc: 'Works flawlessly on tablets, laptops, and mobile screens. Review proposals, manage stock, and approve quotes from anywhere.'
    }
  ];

  return (
    <section id="features" className="quoteflow-features-wrapper">
      <div className="container">
        {/* Section Header */}
        <div className="features-header">
          <h2 className="section-title">Engineered for Rapid Commerce</h2>
          <p className="section-subtext">
            QuoteFlow AI eliminates manual data entry, matching inventory catalog databases, 
            and drafting email responses by automating the entire RFQ pipeline.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-3 features-grid">
          {featuresList.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              desc={feature.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

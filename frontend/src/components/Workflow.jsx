import React, { useState } from 'react';
import './Workflow.css';

/**
 * Workflow Component
 * Displays the 6-step RFQ-to-Quote workflow timeline.
 */
const Workflow = () => {
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    {
      icon: '📄',
      title: 'Upload RFQ',
      desc: 'Upload your RFQ document (PDF or TXT) with a simple drag-and-drop action.'
    },
    {
      icon: '🤖',
      title: 'AI Extraction',
      desc: 'Gemini AI automatically parses products, quantities, and target descriptions.'
    },
    {
      icon: '📦',
      title: 'Inventory Check',
      desc: 'Validates quantity requirements against the database to check availability.'
    },
    {
      icon: '💰',
      title: 'Price Calculation',
      desc: 'Applies matching unit prices,GST taxes, and finalizes line-item costs.'
    },
    {
      icon: '📋',
      title: 'Quote Generation',
      desc: 'Drafts a complete, formatted customer quotation instantly.'
    },
    {
      icon: '✅',
      title: 'Manager Approval',
      desc: 'Routes the quote to manager dashboard for approval before dispatch.'
    }
  ];

  return (
    <section id="workflow" className="quoteflow-workflow-wrapper">
      <div className="container">
        {/* Section Header */}
        <div className="workflow-header">
          <h2 className="section-title">The QuoteFlow Pipeline</h2>
          <p className="section-subtext">
            From raw customer documents to approved quotations in six simple, automated stages.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="workflow-steps-grid">
          {steps.map((step, index) => {
            const isHovered = hoveredStep === index;
            return (
              <div
                key={index}
                className={`workflow-step-card ${isHovered ? 'step-hovered' : ''}`}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Step Connector Line for visual flow */}
                {index < steps.length - 1 && (
                  <div className="step-connector-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--border-color)" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                
                {/* Step Circle Index */}
                <div className="step-number-badge">
                  <span>{index + 1}</span>
                </div>

                {/* Step Graphic / Icon */}
                <div className="step-icon-wrapper">
                  <span className="step-icon">{step.icon}</span>
                </div>

                {/* Details */}
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Workflow;

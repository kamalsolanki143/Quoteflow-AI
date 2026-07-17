import React, { useState } from 'react';
// import './Workflow.css';

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
    <section id="workflow" className="panel-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2>The QuoteFlow Pipeline</h2>
          <p>
            From raw customer documents to approved quotations in six simple, automated stages.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="workflow-timeline">
          {steps.map((step, index) => {
            const isHovered = hoveredStep === index;
            return (
              <div
                key={index}
                className={`workflow-card ${isHovered ? 'workflow-card-hovered' : ''}`}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Step Circle Index */}
                <div className="workflow-num">
                  {index + 1}
                </div>

                {/* Step Graphic / Icon */}
                <div className="workflow-icon">{step.icon}</div>

                {/* Details */}
                <div className="workflow-title">{step.title}</div>
                <div className="workflow-desc">{step.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Workflow;

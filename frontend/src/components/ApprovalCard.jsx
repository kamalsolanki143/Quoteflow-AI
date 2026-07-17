import React from 'react';

const ApprovalCard = ({
  quoteResult,
  approved,
  rejected,
  approvalTime,
  rejectionTime,
  managerName,
  setManagerName,
  overrideNotes,
  setOverrideNotes,
  appliedDiscount,
  setAppliedDiscount,
  overrideReason,
  setOverrideReason,
  expectedDelivery,
  setExpectedDelivery,
  handleApprove,
  handleReject,
  isSubmittingApproval,
  fmt,
  styles,
  palette,
}) => {
  if (!quoteResult) return null;

  return (
    <div className="dashboard-grid">
      {/* Left Column: Details & Items Preview */}
      <div>
        <div className="client-details-card">
          <div className="details-header">RFQ Client Metadata</div>
          <div className="details-item">
            <strong>RFQ Reference:</strong> {quoteResult.rfq_id}
          </div>
          <div className="details-item">
            <strong>Quote ID:</strong> {quoteResult.quote_id}
          </div>
          <div className="details-item">
            <strong>Status:</strong>{" "}
            {approved ? (
              <span style={{ color: palette.success, fontWeight: 700 }}>Approved</span>
            ) : rejected ? (
              <span style={{ color: palette.error, fontWeight: 700 }}>Rejected</span>
            ) : (
              <span style={{ color: palette.warning, fontWeight: 700 }}>Pending Verification</span>
            )}
          </div>
        </div>
        
        <div className="payload-items-card">
          <div className="payload-header">Quotation Items Review</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {quoteResult.line_items.map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: 13, 
                  borderBottom: '1px solid rgba(255,255,255,0.03)', 
                  paddingBottom: 6 
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: palette.white }}>{item.product}</div>
                  <div style={{ color: palette.textMuted, fontSize: 11 }}>SKU: {item.sku}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: palette.text }}>{item.requested_qty} Unit(s)</div>
                  <div style={{ color: palette.accent, fontWeight: 600 }}>{fmt(item.unit_price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Override Form Panel */}
      <div className="override-panel">
        <div className="override-title">Financial Review & Controls</div>
        
        <div className="override-form-group">
          <label className="override-label">Reviewer / Manager Name</label>
          <div className="override-input-wrapper">
            <input 
              type="text" 
              className="override-input" 
              value={managerName} 
              onChange={(e) => setManagerName(e.target.value)}
              disabled={approved || rejected}
            />
            <span className="input-edit-icon">✏️</span>
          </div>
        </div>
        
        <div className="override-form-row">
          <div className="override-form-group">
            <label className="override-label">Applied Discount</label>
            <div className="override-input-wrapper">
              <input 
                type="text" 
                className="override-input" 
                value={appliedDiscount} 
                onChange={(e) => setAppliedDiscount(e.target.value)}
                disabled={approved || rejected}
              />
              <span className="input-edit-icon">✏️</span>
            </div>
          </div>
          
          <div className="override-form-group">
            <label className="override-label">Expected Delivery</label>
            <div className="override-input-wrapper">
              <input 
                type="date" 
                className="override-input" 
                value={expectedDelivery} 
                onChange={(e) => setExpectedDelivery(e.target.value)}
                disabled={approved || rejected}
              />
            </div>
          </div>
        </div>
        
        <div className="override-form-group">
          <label className="override-label">Override Reason</label>
          <div className="override-input-wrapper">
            <input 
              type="text" 
              className="override-input" 
              value={overrideReason} 
              onChange={(e) => setOverrideReason(e.target.value)}
              disabled={approved || rejected}
            />
            <span className="input-edit-icon">✏️</span>
          </div>
        </div>
        
        <div className="override-form-group">
          <label className="override-label">Approval & Audit Notes</label>
          <div className="override-input-wrapper">
            <textarea 
              className="override-input" 
              rows="3" 
              value={overrideNotes} 
              onChange={(e) => setOverrideNotes(e.target.value)}
              disabled={approved || rejected}
              style={{ resize: 'none' }}
            />
          </div>
        </div>
        
        {/* Recommendation Banner */}
        <div className="recommendation-banner">
          <span style={{ fontSize: 16 }}>💡</span>
          <div>
            <strong>AI Pricing Guardrail:</strong> 18% GST and volume discounts have been successfully calculated. Standard approval workflows apply.
          </div>
        </div>
        
        {/* Financial Summary */}
        <div className="finance-summary">
          <div className="finance-row">
            <span>Calculated Subtotal</span>
            <span style={{ color: palette.white }}>{fmt(quoteResult.pricing.subtotal)}</span>
          </div>
          <div className="finance-row">
            <span>GST ({quoteResult.pricing.tax_rate})</span>
            <span style={{ color: palette.white }}>{fmt(quoteResult.pricing.tax_amount)}</span>
          </div>
          <div className="finance-row grand-total">
            <span>Grand Total Cost</span>
            <span style={{ color: palette.accent, fontSize: 18 }}>{fmt(quoteResult.pricing.grand_total)}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="dashboard-actions-row">
          {!approved && !rejected ? (
            <>
              <button 
                className="action-button btn-filled-success" 
                style={{
                  ...styles.uploadBtn,
                  background: `linear-gradient(135deg, ${palette.success}, #00c853)`,
                  boxShadow: `0 4px 20px rgba(0,230,118,0.3)`,
                  margin: 0,
                }}
                onClick={handleApprove}
                disabled={isSubmittingApproval}
              >
                {isSubmittingApproval ? "⏳ Processing..." : "✅ Approve & Dispatch"}
              </button>
              <button 
                className="action-button btn-filled-error" 
                style={{
                  ...styles.uploadBtn,
                  background: `linear-gradient(135deg, ${palette.error}, #ff1744)`,
                  boxShadow: `0 4px 20px rgba(255, 82, 82, 0.3)`,
                  margin: 0,
                }}
                onClick={handleReject}
                disabled={isSubmittingApproval}
              >
                {isSubmittingApproval ? "⏳ Processing..." : "❌ Reject Quote"}
              </button>
            </>
          ) : approved ? (
            <div style={{ textAlign: "center", color: palette.success, fontWeight: 700, padding: 10, background: "rgba(0,230,118,0.06)", borderRadius: 8, width: "100%" }}>
              🎉 Quotation Approved on {approvalTime}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: palette.error, fontWeight: 700, padding: 10, background: "rgba(255,82,82,0.06)", borderRadius: 8, width: "100%" }}>
              ❌ Quotation Rejected on {rejectionTime}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalCard;

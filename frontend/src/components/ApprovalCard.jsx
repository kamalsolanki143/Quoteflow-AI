import React from 'react';

const ApprovalCard = ({ approved, approvalTime, handleApprove, styles, palette }) => {
  return (
    <>
      {/* Approve button */}
      {!approved && (
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button
            style={{
              ...styles.uploadBtn,
              background: `linear-gradient(135deg, ${palette.success}, #00c853)`,
              boxShadow: `0 4px 20px rgba(0,230,118,0.3)`,
            }}
            onClick={handleApprove}
          >
            ✅ Approve Quotation
          </button>
        </div>
      )}

      {approved && (
        <div
          style={{
            textAlign: "center",
            marginTop: 28,
            padding: 20,
            borderRadius: 12,
            background: "rgba(0,230,118,0.06)",
            border: `1px solid rgba(0,230,118,0.2)`,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: palette.success,
            }}
          >
            Quotation Approved!
          </div>
          {approvalTime && (
            <div style={{ fontSize: 13, color: palette.success, marginTop: 4, fontWeight: 500 }}>
              Approved on: {approvalTime}
            </div>
          )}
          <div style={{ fontSize: 13, color: palette.textMuted, marginTop: 6 }}>
            The final quotation has been approved and is ready to be sent to
            the customer.
          </div>
          {/* FUTURE INTEGRATION: Integrate with email delivery service (e.g. SendGrid, Resend)
              or a WhatsApp webhook to automatically dispatch the generated quotation to the customer. */}
        </div>
      )}
    </>
  );
};

export default ApprovalCard;

import React from 'react';
import ApprovalCard from './ApprovalCard';

const QuoteTable = ({
  quoteResult,
  loading,
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
  if (!quoteResult || loading) return null;

  return (
    <section id="quote" style={styles.section}>
      <h2 style={styles.sectionTitle}>Generated Quotation</h2>
      <p style={styles.sectionSub}>
        Quote{" "}
        <strong style={{ color: palette.accent }}>
          {quoteResult.quote_id}
        </strong>{" "}
        for RFQ{" "}
        <strong style={{ color: palette.accent }}>
          {quoteResult.rfq_id}
        </strong>
      </p>

      <div style={styles.quoteResult}>
        {/* Status badge */}
        <div style={{ marginBottom: 20, textAlign: "right" }}>
          <span
            style={{
              ...styles.badge,
              background: approved
                ? "rgba(0,230,118,0.15)"
                : rejected
                ? "rgba(255,82,82,0.15)"
                : "rgba(255,171,0,0.15)",
              color: approved
                ? palette.success
                : rejected
                ? palette.error
                : palette.warning,
            }}
          >
            {approved ? "✅ Approved" : rejected ? "❌ Rejected" : "⏳ Pending Approval"}
          </span>
        </div>

        {/* Line items table */}
        <div className="quote-table-container">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>SKU</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Available</th>
                <th style={styles.th}>Unit Price</th>
                <th style={styles.th}>Line Total</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {quoteResult.line_items.map((item, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{item.product}</td>
                  <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 12 }}>
                    {item.sku}
                  </td>
                  <td style={styles.td}>{item.requested_qty}</td>
                  <td style={styles.td}>{item.available_qty}</td>
                  <td style={styles.td}>{fmt(item.unit_price)}</td>
                  <td style={styles.td}>{fmt(item.line_total)}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background:
                          item.status === "fulfilled"
                            ? "rgba(0,230,118,0.12)"
                            : "rgba(255,171,0,0.12)",
                        color:
                          item.status === "fulfilled"
                            ? palette.success
                            : palette.warning,
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ textAlign: "right", lineHeight: 2 }}>
            <div style={{ color: palette.textMuted }}>
              Subtotal:{" "}
              <strong style={{ color: palette.text }}>
                {fmt(quoteResult.pricing.subtotal)}
              </strong>
            </div>
            <div style={{ color: palette.textMuted }}>
              GST ({quoteResult.pricing.tax_rate}):{" "}
              <strong style={{ color: palette.text }}>
                {fmt(quoteResult.pricing.tax_amount)}
              </strong>
            </div>
            <div style={styles.totalRow}>
              Grand Total:{" "}
              <span style={{ color: palette.accent, fontSize: 20 }}>
                {fmt(quoteResult.pricing.grand_total)}
              </span>
            </div>
          </div>
        </div>

        <ApprovalCard 
          quoteResult={quoteResult}
          approved={approved}
          rejected={rejected}
          approvalTime={approvalTime}
          rejectionTime={rejectionTime}
          managerName={managerName}
          setManagerName={setManagerName}
          overrideNotes={overrideNotes}
          setOverrideNotes={setOverrideNotes}
          appliedDiscount={appliedDiscount}
          setAppliedDiscount={setAppliedDiscount}
          overrideReason={overrideReason}
          setOverrideReason={setOverrideReason}
          expectedDelivery={expectedDelivery}
          setExpectedDelivery={setExpectedDelivery}
          handleApprove={handleApprove}
          handleReject={handleReject}
          isSubmittingApproval={isSubmittingApproval}
          fmt={fmt}
          styles={styles}
          palette={palette}
        />
      </div>
    </section>
  );
};

export default QuoteTable;

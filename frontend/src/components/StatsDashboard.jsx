import React from 'react';

const StatsDashboard = ({ totalProducts, totalStockUnits, DASHBOARD_STATS, palette, styles }) => {
  return (
    <div className="stats-grid" style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 20,
      maxWidth: 1120,
      margin: "0 auto 40px",
      padding: "0 24px",
    }}>
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 32 }}>📁</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: palette.white }}>{DASHBOARD_STATS.rfqsProcessed}</div>
            <div style={{ fontSize: 12, color: palette.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>RFQs Processed</div>
          </div>
        </div>
      </div>
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 32 }}>📦</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: palette.white }}>{totalProducts}</div>
            <div style={{ fontSize: 12, color: palette.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>Products Available</div>
          </div>
        </div>
      </div>
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 32 }}>📊</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: palette.white }}>{totalStockUnits}</div>
            <div style={{ fontSize: 12, color: palette.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>Total Stock Units</div>
          </div>
        </div>
      </div>
      <div style={{ ...styles.card, boxShadow: `0 0 15px rgba(108,99,255,0.15)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 32 }}>⚡</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: palette.accent }}>{DASHBOARD_STATS.avgProcessingTime}</div>
            <div style={{ fontSize: 12, color: palette.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>Avg Time</div>
          </div>
        </div>
      </div>
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 32 }}>📈</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: palette.white }}>{DASHBOARD_STATS.approvalRate}</div>
            <div style={{ fontSize: 12, color: palette.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>Approval Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;

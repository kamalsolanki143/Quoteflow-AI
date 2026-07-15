import React from 'react';

const InventoryPreview = ({ loadingInventory, inventory, inventoryError, fetchInventory, fmt, styles, palette }) => {
  return (
    <section id="inventory" style={styles.section}>
      <h2 style={styles.sectionTitle}>Inventory Preview</h2>
      <p style={styles.sectionSub}>
        Real-time snapshot of the database showing stock levels and availability status.
      </p>
      
      <div style={styles.quoteResult}>
        {loadingInventory ? (
          <div style={{ textAlign: "center", padding: 20, color: palette.textMuted }}>
            Loading inventory catalog...
          </div>
        ) : inventory.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: palette.textMuted }}>
            <div style={{ marginBottom: 12 }}>{inventoryError || "No inventory data available"}</div>
            <button
              style={{
                ...styles.uploadBtn,
                marginTop: 0,
                padding: "8px 20px",
                fontSize: 12,
              }}
              onClick={fetchInventory}
            >
              🔄 Refresh Inventory
            </button>
          </div>
        ) : (
          <div className="quote-table-container">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Product Name</th>
                  <th style={styles.th}>SKU</th>
                  <th style={styles.th}>Stock Available</th>
                  <th style={styles.th}>Unit Price</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.slice(0, 5).map((item) => {
                  let badgeBg = "rgba(255, 82, 82, 0.12)";
                  let badgeColor = palette.error;
                  if (item.status === "in_stock") {
                    badgeBg = "rgba(0, 230, 118, 0.12)";
                    badgeColor = palette.success;
                  } else if (item.status === "low_stock") {
                    badgeBg = "rgba(255, 171, 0, 0.12)";
                    badgeColor = palette.warning;
                  }
                  
                  return (
                    <tr key={item.id}>
                      <td style={styles.td}>{item.name}</td>
                      <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 12 }}>
                        {item.sku}
                      </td>
                      <td style={styles.td}>{item.stock} units</td>
                      <td style={styles.td}>{fmt(item.unit_price)}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            background: badgeBg,
                            color: badgeColor,
                          }}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default InventoryPreview;

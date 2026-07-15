import React from 'react';

const RFQUpload = ({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  fileInputRef,
  selectedFile,
  onFileChange,
  loading,
  error,
  handleUpload,
  timelineStep,
  PROCESSING_STEPS,
  approved,
  styles,
  palette,
  SkeletonRow
}) => {
  return (
    <>
      {/* ================================================================= */}
      {/*  UPLOAD SECTION                                                   */}
      {/* ================================================================= */}
      <section id="upload" style={styles.section}>
        <h2 style={styles.sectionTitle}>Upload Your RFQ</h2>
        <p style={styles.sectionSub}>
          Drop your PDF or TXT file below — our AI will handle the rest.
        </p>

        <div
          className="upload-zone-container"
          style={{
            ...styles.uploadZone,
            ...(isDragOver ? styles.uploadZoneActive : {}),
          }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={styles.uploadIcon}>
            {selectedFile ? "📎" : isDragOver ? "🎯" : "☁️"}
          </div>
          <div style={styles.uploadLabel}>
            {selectedFile
              ? selectedFile.name
              : "Drag & drop your RFQ file here"}
          </div>
          <div style={styles.uploadHint}>
            {selectedFile
              ? `${(selectedFile.size / 1024).toFixed(1)} KB — ready to upload`
              : "Supports PDF and TXT • Max 10 MB"}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={onFileChange}
            style={{ display: "none" }}
          />
        </div>

        {selectedFile && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              style={{
                ...styles.uploadBtn,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "wait" : "pointer",
              }}
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? "⏳ Processing…" : "🚀 Generate Quotation"}
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/*  ERROR BOUNDARY UI                                                */}
        {/* ================================================================= */}
        {error && (
          <div
            style={{
              maxWidth: 600,
              margin: "24px auto 0",
              background: "rgba(255, 82, 82, 0.05)",
              border: `1px solid ${palette.error}`,
              borderRadius: 12,
              padding: 24,
              textAlign: "center",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ color: palette.white, margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>
              Processing Failed
            </h3>
            <p style={{ color: palette.text, fontSize: 14, margin: "0 0 16px", lineHeight: 1.5 }}>
              {error}
            </p>
            <p style={{ color: palette.textMuted, fontSize: 12, margin: "0 0 20px" }}>
              Our systems encountered an unexpected error. Please verify the document format or try again. For further assistance, please contact the project administrator.
            </p>
            <button
              style={{
                ...styles.uploadBtn,
                background: `linear-gradient(135deg, ${palette.error}, #ff1744)`,
                boxShadow: `0 4px 20px rgba(255, 82, 82, 0.3)`,
                marginTop: 0,
                opacity: !selectedFile ? 0.5 : 1,
              }}
              onClick={handleUpload}
              disabled={!selectedFile}
            >
              🔄 Retry Operation
            </button>
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/*  RFQ PROCESSING TIMELINE                                          */}
      {/* ================================================================= */}
      {(loading || (timelineStep > 0 && timelineStep <= 5)) && (
        <section style={{ ...styles.section, paddingTop: 0 }}>
          <div style={{
            ...styles.card,
            maxWidth: 600,
            margin: "0 auto",
            textAlign: "center",
          }}>
            <h3 style={{ color: palette.white, fontSize: 18, marginBottom: 20, fontWeight: 700 }}>
              RFQ Processing Pipeline
            </h3>
            
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}>
              {PROCESSING_STEPS.map((stepLabel, idx) => {
                const stepNum = idx + 1;
                const isActive = timelineStep === stepNum;
                const isCompleted = timelineStep > stepNum;
                
                let stepBg = "rgba(255,255,255,0.05)";
                let shadow = "none";
                let color = palette.textMuted;
                
                if (isCompleted) {
                  stepBg = palette.success;
                  color = palette.white;
                } else if (isActive) {
                  stepBg = stepNum === 5 && approved ? palette.success : palette.accent;
                  color = palette.white;
                  shadow = `0 0 10px ${stepNum === 5 && approved ? palette.success : palette.accent}`;
                } else if (stepNum === 5 && approved) {
                  stepBg = palette.success;
                  color = palette.white;
                }
                
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <div className="timeline-arrow">↓</div>}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      color: color,
                      fontWeight: isActive ? 700 : 500,
                      transition: "color 0.3s",
                    }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: stepBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        boxShadow: shadow,
                        border: `1px solid ${isCompleted || isActive ? "transparent" : palette.cardBorder}`,
                      }}>
                        {isCompleted || (stepNum === 5 && approved) ? "✓" : stepNum}
                      </div>
                      <span>{stepNum === 5 && approved ? "Approved" : stepLabel}</span>
                      {isActive && !approved && (
                        stepNum === 5 ? <span className="timeline-pulse" /> : <span className="timeline-spinner" />
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================= */}
      {/*  LOADING SKELETONS                                                */}
      {/* ================================================================= */}
      {loading && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Generating Quotation</h2>
          <p style={styles.sectionSub}>Please wait while AI processes the RFQ and matches inventory...</p>
          <div style={styles.quoteResult}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div className="skeleton" style={{ width: "200px", height: "24px" }} />
              <div className="skeleton" style={{ width: "120px", height: "24px", borderRadius: 999 }} />
            </div>
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
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
              <div style={{ textAlign: "right" }}>
                <div className="skeleton" style={{ width: "150px", height: "16px", marginBottom: 8 }} />
                <div className="skeleton" style={{ width: "150px", height: "16px", marginBottom: 8 }} />
                <div className="skeleton" style={{ width: "200px", height: "24px" }} />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default RFQUpload;

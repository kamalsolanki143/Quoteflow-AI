/**
 * QuoteFlow AI — Main Application Component
 * ============================================
 * Professional React entry page for the AI-powered RFQ-to-Quote system.
 *
 * Features:
 *  • Hero section with project branding
 *  • Interactive RFQ file upload with drag-and-drop
 *  • Live workflow visualisation
 *  • Inventory preview panel
 *  • Backend health indicator
 *
 * Hackathon: FlowZint AI Hackathon 2026
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { checkHealth, uploadRFQ, generateQuote, getInventory } from "./services/api";

/* ========================================================================= */
/*  INLINE STYLES — premium dark-mode glassmorphism theme                    */
/* ========================================================================= */

const palette = {
  bg: "#0a0e1a",
  card: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.08)",
  accent: "#6c63ff",
  accentGlow: "rgba(108,99,255,0.35)",
  success: "#00e676",
  warning: "#ffab00",
  error: "#ff5252",
  text: "#e0e0e0",
  textMuted: "#888",
  white: "#fff",
};

const font =
  "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";

const styles = {
  /* ---- global reset ---- */
  app: {
    margin: 0,
    padding: 0,
    fontFamily: font,
    background: `linear-gradient(145deg, ${palette.bg} 0%, #111827 50%, #0a0e1a 100%)`,
    color: palette.text,
    minHeight: "100vh",
    overflowX: "hidden",
  },

  /* ---- Navbar ---- */
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 40px",
    backdropFilter: "blur(18px)",
    background: "rgba(10,14,26,0.75)",
    borderBottom: `1px solid ${palette.cardBorder}`,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.5px",
    color: palette.white,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    transition: "background 0.4s",
  },
  navLinks: {
    display: "flex",
    gap: 24,
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  navLink: {
    color: palette.textMuted,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "color 0.2s",
  },

  /* ---- Hero ---- */
  hero: {
    textAlign: "center",
    padding: "80px 20px 40px",
    position: "relative",
  },
  heroBadge: {
    display: "inline-block",
    padding: "6px 18px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    background: palette.accentGlow,
    color: palette.accent,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: "clamp(36px, 5vw, 64px)",
    fontWeight: 900,
    lineHeight: 1.1,
    color: palette.white,
    margin: "0 0 20px",
  },
  heroGradient: {
    background: `linear-gradient(90deg, ${palette.accent}, #a78bfa, #38bdf8)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: {
    maxWidth: 640,
    margin: "0 auto 40px",
    fontSize: 17,
    lineHeight: 1.7,
    color: palette.textMuted,
  },

  /* ---- Section ---- */
  section: {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "40px 24px",
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: palette.white,
    marginBottom: 8,
    textAlign: "center",
  },
  sectionSub: {
    textAlign: "center",
    color: palette.textMuted,
    marginBottom: 40,
    fontSize: 15,
  },

  /* ---- Glass Card ---- */
  card: {
    background: palette.card,
    border: `1px solid ${palette.cardBorder}`,
    borderRadius: 16,
    padding: 28,
    backdropFilter: "blur(12px)",
    transition: "transform 0.25s, box-shadow 0.25s",
  },
  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: `0 12px 40px ${palette.accentGlow}`,
  },

  /* ---- Upload Zone ---- */
  uploadZone: {
    border: `2px dashed ${palette.cardBorder}`,
    borderRadius: 16,
    padding: "48px 24px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.3s, background 0.3s",
    background: palette.card,
    maxWidth: 600,
    margin: "0 auto",
  },
  uploadZoneActive: {
    borderColor: palette.accent,
    background: "rgba(108,99,255,0.08)",
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: palette.white,
    marginBottom: 6,
  },
  uploadHint: {
    fontSize: 13,
    color: palette.textMuted,
  },
  uploadBtn: {
    marginTop: 20,
    padding: "12px 32px",
    borderRadius: 10,
    border: "none",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    color: palette.white,
    background: `linear-gradient(135deg, ${palette.accent}, #a78bfa)`,
    boxShadow: `0 4px 20px ${palette.accentGlow}`,
    transition: "transform 0.2s, box-shadow 0.2s",
  },

  /* ---- Workflow Steps ---- */
  workflowGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
  },
  stepCard: {
    position: "relative",
    background: palette.card,
    border: `1px solid ${palette.cardBorder}`,
    borderRadius: 14,
    padding: "28px 22px",
    backdropFilter: "blur(12px)",
    textAlign: "center",
    transition: "transform 0.25s, box-shadow 0.25s",
    cursor: "default",
  },
  stepNumber: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: "50%",
    fontWeight: 800,
    fontSize: 14,
    marginBottom: 14,
    background: `linear-gradient(135deg, ${palette.accent}, #a78bfa)`,
    color: palette.white,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: palette.white,
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 13,
    color: palette.textMuted,
    lineHeight: 1.55,
  },

  /* ---- Quote Result ---- */
  quoteResult: {
    maxWidth: 800,
    margin: "0 auto",
    background: palette.card,
    border: `1px solid ${palette.cardBorder}`,
    borderRadius: 16,
    padding: 28,
    backdropFilter: "blur(12px)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 16,
    fontSize: 13,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: `1px solid ${palette.cardBorder}`,
    color: palette.accent,
    fontWeight: 700,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  td: {
    padding: "10px 12px",
    borderBottom: `1px solid rgba(255,255,255,0.03)`,
    color: palette.text,
  },
  totalRow: {
    fontWeight: 700,
    color: palette.white,
    fontSize: 15,
  },

  /* ---- Status Badge ---- */
  badge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  /* ---- Footer ---- */
  footer: {
    textAlign: "center",
    padding: "40px 20px 24px",
    fontSize: 13,
    color: palette.textMuted,
    borderTop: `1px solid ${palette.cardBorder}`,
    marginTop: 60,
  },
};

/* ========================================================================= */
/*  WORKFLOW STEPS DATA                                                      */
/* ========================================================================= */

const WORKFLOW_STEPS = [
  {
    icon: "📄",
    title: "Upload RFQ",
    desc: "Upload your RFQ document (PDF or TXT) with a simple drag-and-drop.",
  },
  {
    icon: "🤖",
    title: "AI Extraction",
    desc: "Gemini AI extracts products, quantities, and specifications automatically.",
  },
  {
    icon: "📦",
    title: "Inventory Check",
    desc: "Real-time validation against the product inventory database.",
  },
  {
    icon: "💰",
    title: "Price Calculation",
    desc: "Accurate pricing with tax computation and volume handling.",
  },
  {
    icon: "📋",
    title: "Quote Generation",
    desc: "Professional quotation generated instantly with full line-item detail.",
  },
  {
    icon: "✅",
    title: "Manager Approval",
    desc: "One-click approval workflow before the final quote is dispatched.",
  },
];

/* ========================================================================= */
/*  DASHBOARD CONSTANTS                                                      */
/* ========================================================================= */

const DASHBOARD_STATS = {
  rfqsProcessed: 1284,
  productsAvailable: 5,
  totalStockUnits: 490,
  avgProcessingTime: "1.8s",
  approvalRate: "98.4%"
};

const PROCESSING_STEPS = [
  "RFQ Uploaded",
  "AI Extraction",
  "Inventory Validation",
  "Quote Generation",
  "Approval Pending"
];

const TIMELINE_DELAY_MS = 900;

/* ========================================================================= */
/*  COMPONENT                                                                */
/* ========================================================================= */

export default function App() {
  // ---- State ----
  const [healthStatus, setHealthStatus] = useState("checking");
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [quoteResult, setQuoteResult] = useState(null);
  const [approved, setApproved] = useState(false);
  const [approvalTime, setApprovalTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [inventoryError, setInventoryError] = useState(null);
  const [timelineStep, setTimelineStep] = useState(0);
  const fileInputRef = useRef(null);

  // ---- Health check and inventory fetch on mount ----
  useEffect(() => {
    checkHealth()
      .then(() => setHealthStatus("healthy"))
      .catch(() => setHealthStatus("offline"));

    fetchInventory();
  }, []);

  const fetchInventory = () => {
    setLoadingInventory(true);
    setInventoryError(null);
    // FUTURE INTEGRATION: Replace mock JSON database backend with a production database
    // (e.g. PostgreSQL, MongoDB, or MySQL) to store and query the full product catalog and live inventory.
    getInventory()
      .then((res) => {
        const products = res?.data?.data?.products || res?.data?.products || [];
        setInventory(products);
      })
      .catch((err) => {
        console.error("Failed to load inventory:", err);
        setInventory([]);
        setInventoryError("Unable to load inventory data. Please try again.");
      })
      .finally(() => {
        setLoadingInventory(false);
      });
  };

  // ---- Drag & Drop handlers ----
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  const onDragLeave = useCallback(() => setIsDragOver(false), []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTimelineStep(0);
      setQuoteResult(null);
    }
  }, []);

  // ---- File input change ----
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTimelineStep(0);
      setQuoteResult(null);
    }
  };

  // ---- Upload & Generate Flow ----
  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setQuoteResult(null);
    setApproved(false);
    setApprovalTime(null);
    setTimelineStep(1); // Step 1: RFQ Uploaded
    try {
      // Step 1 — Upload
      const uploadRes = await uploadRFQ(selectedFile);

      // FUTURE INTEGRATION: Connect Gemini AI extraction engine here.
      // The response uploadRes.data.extracted_items will parse the uploaded RFQ PDF/TXT file
      // using Gemini API (e.g. gemini-2.5-flash) and structure it as a clean array of items.

      // Step 2 — AI Extraction (visual simulation delay)
      setTimelineStep(2);
      await new Promise((resolve) => setTimeout(resolve, TIMELINE_DELAY_MS));

      // Step 3 — Inventory Validation (visual simulation delay)
      setTimelineStep(3);
      await new Promise((resolve) => setTimeout(resolve, TIMELINE_DELAY_MS));

      // Step 4 — Quote Generation
      setTimelineStep(4);

      // (In production, items would come from AI extraction)
      const sampleItems = {
        rfq_id: uploadRes.data.rfq_id,
        items: [
          { product: "HP Laptop", quantity: 50 },
          { product: "Dell Monitor", quantity: 20 },
          { product: "Canon Printer", quantity: 10 },
          { product: "Lenovo ThinkPad", quantity: 15 },
          { product: "Logitech Keyboard", quantity: 80 },
        ],
      };

      const extractedItems = uploadRes.data.items
        ? { rfq_id: uploadRes.data.rfq_id, items: uploadRes.data.items }
        : sampleItems;

      const quoteRes = await generateQuote(extractedItems);
      
      // Step 5 — Approval Pending
      setTimelineStep(5);
      setQuoteResult(quoteRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Something went wrong");
      setTimelineStep(0); // Reset timeline on error
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setApproved(true);
    setApprovalTime(new Date().toLocaleString());
    setTimelineStep(0);
  };

  // ---- Render helpers ----
  const statusColor =
    healthStatus === "healthy"
      ? palette.success
      : healthStatus === "offline"
      ? palette.error
      : palette.warning;

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

  const totalProducts = inventory.length;

  const totalStockUnits = inventory.reduce(
    (sum, item) => sum + (item.stock || 0),
    0
  );

  const SkeletonRow = () => (
    <tr>
      <td style={styles.td}><div className="skeleton" style={{ width: "120px", height: "16px" }} /></td>
      <td style={styles.td}><div className="skeleton" style={{ width: "80px", height: "16px" }} /></td>
      <td style={styles.td}><div className="skeleton" style={{ width: "30px", height: "16px" }} /></td>
      <td style={styles.td}><div className="skeleton" style={{ width: "30px", height: "16px" }} /></td>
      <td style={styles.td}><div className="skeleton" style={{ width: "60px", height: "16px" }} /></td>
      <td style={styles.td}><div className="skeleton" style={{ width: "80px", height: "16px" }} /></td>
      <td style={styles.td}><div className="skeleton" style={{ width: "70px", height: "16px" }} /></td>
    </tr>
  );

  /* ======================================================================= */
  return (
    <div style={styles.app}>
      {/* ---- Google Fonts ---- */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
          60% { transform: translateY(-3px); }
        }
        .skeleton {
          animation: pulse 1.5s infinite ease-in-out;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .timeline-arrow {
          font-size: 20px;
          margin: 6px 0;
          color: ${palette.accent};
          animation: bounce 2s infinite;
        }
        .timeline-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid ${palette.accent};
          border-top-color: transparent;
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.8s linear infinite;
        }
        .timeline-pulse {
          width: 8px;
          height: 8px;
          background: ${palette.warning};
          border-radius: 50%;
          display: inline-block;
          animation: pulse 1s infinite ease-in-out;
        }
        
        /* Mobile overrides */
        @media (max-width: 768px) {
          .nav-container {
            flex-direction: column !important;
            gap: 12px;
            padding: 16px 20px !important;
            align-items: center !important;
          }
          .nav-links {
            gap: 16px !important;
            justify-content: center;
            flex-wrap: wrap;
          }
          .quote-table-container {
            overflow-x: auto;
            width: 100%;
            -webkit-overflow-scrolling: touch;
          }
          .upload-zone-container {
            padding: 32px 16px !important;
          }
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ================================================================= */}
      {/*  DEMO MODE BANNER                                                 */}
      {/* ================================================================= */}
      <div
        style={{
          background: `linear-gradient(90deg, ${palette.accent}, #4f46e5)`,
          color: palette.white,
          textAlign: "center",
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 0.5,
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          position: "relative",
          zIndex: 101,
        }}
      >
        🚀 Demo Mode — Using Mock Inventory & Sample RFQs
      </div>

      {/* ================================================================= */}
      {/*  NAVBAR                                                           */}
      {/* ================================================================= */}
      <nav className="nav-container" style={styles.nav}>
        <div style={styles.logo}>
          <span style={{ fontSize: 26 }}>⚡</span>
          QuoteFlow <span style={{ ...styles.heroGradient }}>AI</span>
        </div>
        <ul className="nav-links" style={styles.navLinks}>
          <li>
            <a href="#upload" style={styles.navLink}>
              Upload
            </a>
          </li>
          <li>
            <a href="#workflow" style={styles.navLink}>
              Workflow
            </a>
          </li>
          <li>
            <a href="#inventory" style={styles.navLink}>
              Inventory
            </a>
          </li>
          <li>
            <a href="#quote" style={styles.navLink}>
              Quote
            </a>
          </li>
          <li style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                ...styles.logoDot,
                background: statusColor,
                boxShadow: `0 0 8px ${statusColor}`,
              }}
            />
            <span style={{ fontSize: 12, color: statusColor, fontWeight: 600 }}>
              {healthStatus === "healthy"
                ? "API Online"
                : healthStatus === "offline"
                ? "API Offline"
                : "Checking…"}
            </span>
          </li>
        </ul>
      </nav>

      {/* ================================================================= */}
      {/*  HERO                                                             */}
      {/* ================================================================= */}
      <header style={styles.hero}>
        <div style={styles.heroBadge}>FlowZint AI Hackathon 2026</div>
        <h1 style={styles.heroTitle}>
          RFQ to Quote,{" "}
          <span style={styles.heroGradient}>Automated by AI</span>
        </h1>
        <p style={styles.heroSub}>
          QuoteFlow AI transforms your Request For Quotation documents into
          professional, accurate quotations in seconds — powered by Gemini AI,
          real-time inventory validation, and intelligent pricing.
        </p>
      </header>

      {/* ================================================================= */}
      {/*  STATISTICS CARDS                                                 */}
      {/* ================================================================= */}
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

      {/* ================================================================= */}
      {/*  INVENTORY PREVIEW SECTION                                        */}
      {/* ================================================================= */}
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

      {/* ================================================================= */}
      {/*  WORKFLOW SECTION                                                  */}
      {/* ================================================================= */}
      <section id="workflow" style={styles.section}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <p style={styles.sectionSub}>
          Six intelligent steps — from document to approved quotation.
        </p>

        <div style={styles.workflowGrid}>
          {WORKFLOW_STEPS.map((step, i) => (
            <div
              key={i}
              style={{
                ...styles.stepCard,
                ...(hoveredStep === i ? styles.cardHover : {}),
              }}
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div style={styles.stepNumber}>{i + 1}</div>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{step.icon}</div>
              <div style={styles.stepTitle}>{step.title}</div>
              <div style={styles.stepDesc}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/*  QUOTE RESULT SECTION                                             */}
      {/* ================================================================= */}
      {quoteResult && !loading && (
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
                    : "rgba(255,171,0,0.15)",
                  color: approved ? palette.success : palette.warning,
                }}
              >
                {approved ? "✅ Approved" : "⏳ Pending Approval"}
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
          </div>
        </section>
      )}

      {/* ================================================================= */}
      {/*  FOOTER                                                           */}
      {/* ================================================================= */}
      <footer style={styles.footer}>
        <p>
          ⚡ <strong>QuoteFlow AI</strong> — FlowZint AI Hackathon 2026
        </p>
        <p style={{ marginTop: 4 }}>
          Built with FastAPI • React • Gemini AI • ❤️
        </p>
      </footer>
    </div>
  );
}

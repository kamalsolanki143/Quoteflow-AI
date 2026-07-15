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
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsDashboard from "./components/StatsDashboard";
import Workflow from "./components/Workflow";
import Features from "./components/Features";
import RFQUpload from "./components/RFQUpload";
import InventoryPreview from "./components/InventoryPreview";
import QuoteTable from "./components/QuoteTable";

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

      const extractedItems = uploadRes.data.extracted_items
        ? (Array.isArray(uploadRes.data.extracted_items)
            ? { rfq_id: uploadRes.data.rfq_id, items: uploadRes.data.extracted_items }
            : uploadRes.data.extracted_items)
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
      <Navbar healthStatus={healthStatus} />

      {/* ================================================================= */}
      {/*  HERO                                                             */}
      {/* ================================================================= */}
      <Hero />

      {/* ================================================================= */}
      {/*  STATISTICS CARDS                                                 */}
      {/* ================================================================= */}
      <StatsDashboard 
        totalProducts={totalProducts} 
        totalStockUnits={totalStockUnits} 
        DASHBOARD_STATS={DASHBOARD_STATS}
        palette={palette}
        styles={styles}
      />

      <RFQUpload
        isDragOver={isDragOver}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        fileInputRef={fileInputRef}
        selectedFile={selectedFile}
        onFileChange={onFileChange}
        loading={loading}
        error={error}
        handleUpload={handleUpload}
        timelineStep={timelineStep}
        PROCESSING_STEPS={PROCESSING_STEPS}
        approved={approved}
        styles={styles}
        palette={palette}
        SkeletonRow={SkeletonRow}
      />

      {/* ================================================================= */}
      {/*  INVENTORY PREVIEW SECTION                                        */}
      {/* ================================================================= */}
      <InventoryPreview
        loadingInventory={loadingInventory}
        inventory={inventory}
        inventoryError={inventoryError}
        fetchInventory={fetchInventory}
        fmt={fmt}
        styles={styles}
        palette={palette}
      />

      {/* ================================================================= */}
      {/*  FEATURES & WORKFLOW SECTION                                      */}
      {/* ================================================================= */}
      <Features />
      <Workflow />

      {/* ================================================================= */}
      {/*  QUOTE RESULT SECTION                                             */}
      {/* ================================================================= */}
      <QuoteTable
        quoteResult={quoteResult}
        loading={loading}
        approved={approved}
        approvalTime={approvalTime}
        handleApprove={handleApprove}
        fmt={fmt}
        styles={styles}
        palette={palette}
      />

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

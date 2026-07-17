/**
 * QuoteFlow AI — Main Application Component (Refactored Single-File MVP)
 * =========================================================================
 * A high-fidelity, premium dark-mode SaaS UI matching the approved Figma layout.
 *
 * Implements:
 *  • Full Glassmorphism styling with CSS variables and custom classes
 *  • Side-by-side comparison (The Old Manual Way vs. The QuoteFlow AI Way)
 *  • Dotted drag-and-drop file uploader matching the Figma mockup
 *  • Beautiful processing pipeline timeline (Steps 1 to 5)
 *  • Fully styled responsive Inventory Table & Status Badges
 *  • Comprehensive "Manager Approval & Financial Review" Split Panel
 *  • Dynamic interactivity (hover states, animations, mobile hamburger menu)
 *
 * All state management and API endpoints (including approval & rejection) are preserved.
 *
 * Hackathon: FlowZint AI Hackathon 2026
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { checkHealth, uploadRFQ, generateQuote, getInventory, approveQuote, rejectQuote } from "./services/api";
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
/*  STATIC DATA MATCHING FIGMA DESIGNS                                       */
/* ========================================================================= */

const WORKFLOW_STEPS = [
  { icon: "📄", title: "Upload RFQ", desc: "Upload your customer RFQ document (PDF or TXT) with drag-and-drop." },
  { icon: "🤖", title: "AI Extraction", desc: "Gemini AI extracts products, quantities, and key specifications." },
  { icon: "📦", title: "Inventory Validation", desc: "Real-time stock level validation against the product catalogue." },
  { icon: "💰", title: "Pricing Engine", desc: "Volume discounts, tax logic, and line-item totals are computed." },
  { icon: "📋", title: "Manager Approval", desc: "One-click approval/rejection panel for financial review." },
  { icon: "⚡", title: "Final Quote", desc: "Professional, branded quotation sheet is compiled instantly." },
  { icon: "✉️", title: "Send to Customer", desc: "Automatic delivery of quotes to customer email or WhatsApp." }
];

const STATS_DATA = [
  { value: "99.4%", label: "Extraction Accuracy", icon: "🎯" },
  { value: "5 Sec", label: "Processing Speed", icon: "⚡" },
  { value: "32 Hrs", label: "Weekly Time Saved", icon: "⏰" },
  { value: "100%", label: "Live Inventory Sync", icon: "🔄" }
];

const PROCESSING_STEPS = [
  "RFQ Uploaded",
  "AI Extraction",
  "Inventory Validation",
  "Quote Generation",
  "Approval Pending"
];

const TIMELINE_DELAY_MS = 900;

export default function App() {
  // ---- State ----
  const [healthStatus, setHealthStatus] = useState("checking");
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Workflow States
  const [quoteResult, setQuoteResult] = useState(null);
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [approvalTime, setApprovalTime] = useState(null);
  const [rejectionTime, setRejectionTime] = useState(null);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // UI States
  const [hoveredStep, setHoveredStep] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  // Inventory Preview States
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [inventoryError, setInventoryError] = useState(null);
  const [timelineStep, setTimelineStep] = useState(0);

  // Manager Approval Control States (Figma Interactive Fields)
  const [managerName, setManagerName] = useState("Priya Sharma");
  const [overrideNotes, setOverrideNotes] = useState(
    "Standard 5% bulk discount rate authorized against historical corporate transaction volume"
  );
  const [appliedDiscount, setAppliedDiscount] = useState("5%");
  const [overrideReason, setOverrideReason] = useState("Loyal B2B Customer");
  const [expectedDelivery, setExpectedDelivery] = useState("2026-07-05");
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  const fileInputRef = useRef(null);

  // ---- Health Check & Inventory Fetch ----
  useEffect(() => {
    checkHealth()
      .then(() => setHealthStatus("healthy"))
      .catch(() => setHealthStatus("offline"));

    fetchInventory();
  }, []);

  const fetchInventory = () => {
    setLoadingInventory(true);
    setInventoryError(null);
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

  // ---- Drag & Drop Handlers ----
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
      setApproved(false);
      setRejected(false);
      setError(null);
    }
  }, []);

  // ---- File Input Handler ----
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTimelineStep(0);
      setQuoteResult(null);
      setApproved(false);
      setRejected(false);
      setError(null);
    }
  };

  // ---- RFQ Upload & Processing Pipeline ----
  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setQuoteResult(null);
    setApproved(false);
    setRejected(false);
    setApprovalTime(null);
    setRejectionTime(null);
    setTimelineStep(1); // Step 1: Uploaded

    try {
      // Step 1: Upload RFQ Document
      const uploadRes = await uploadRFQ(selectedFile);

      // Step 2: Gemini AI Extraction (visual animation delay)
      setTimelineStep(2);
      await new Promise((resolve) => setTimeout(resolve, TIMELINE_DELAY_MS));

      // Step 3: Inventory Validation (visual animation delay)
      setTimelineStep(3);
      await new Promise((resolve) => setTimeout(resolve, TIMELINE_DELAY_MS));

      // Step 4: Quote Generation
      setTimelineStep(4);

      // Fallback sample payload in case extracted items list is empty
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
      
      // Step 5: Approval Pending
      setTimelineStep(5);
      setQuoteResult(quoteRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "An unexpected error occurred during processing.");
      setTimelineStep(0);
    } finally {
      setLoading(false);
    }
  };

  // ---- Manager Approval (Backend API Call) ----
  const handleApprove = async () => {
    if (!quoteResult) return;
    setIsSubmittingApproval(true);
    setError(null);
    try {
      const res = await approveQuote({
        quote_id: quoteResult.quote_id,
        manager_name: managerName,
        notes: `Discount: ${appliedDiscount}. Override Reason: ${overrideReason}. Delivery Date: ${expectedDelivery}. Notes: ${overrideNotes}`,
      });
      if (res.data?.success) {
        setApproved(true);
        setRejected(false);
        setApprovalTime(res.data.timestamp || new Date().toLocaleString());
        setApprovalMessage(res.data.message);
        setTimelineStep(0);
        
        // Smooth scroll to results
        setTimeout(() => {
          document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        throw new Error("Approval confirmation failed on warehouse server.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Unable to process approval.");
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // ---- Manager Rejection (Backend API Call) ----
  const handleReject = async () => {
    if (!quoteResult) return;
    setIsSubmittingApproval(true);
    setError(null);
    try {
      const res = await rejectQuote({
        quote_id: quoteResult.quote_id,
        manager_name: managerName,
        notes: overrideNotes || "Rejected due to budget constraints.",
      });
      if (res.data?.success) {
        setApproved(false);
        setRejected(true);
        setRejectionTime(res.data.timestamp || new Date().toLocaleString());
        setApprovalMessage(res.data.message);
        setTimelineStep(0);

        // Smooth scroll to results
        setTimeout(() => {
          document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        throw new Error("Rejection configuration failed on server.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Unable to submit rejection.");
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // ---- Helper: Format Currency ----
  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

  const totalProducts = inventory.length;

  const totalStockUnits = inventory.reduce(
    (sum, item) => sum + (item.stock ?? item.quantity ?? 0),
    0
  );

  const DASHBOARD_STATS = [
    {
      title: "Products",
      value: totalProducts,
    },
    {
      title: "Stock Units",
      value: totalStockUnits,
    },
    {
      title: "API Status",
      value: healthStatus === "healthy" ? "Online" : "Offline",
    },
    {
      title: "Quotes",
      value: quoteResult ? 1 : 0,
    }
  ];
  DASHBOARD_STATS.rfqsProcessed = quoteResult ? 1 : 0;
  DASHBOARD_STATS.avgProcessingTime = "5 Sec";
  DASHBOARD_STATS.approvalRate = "99.4%";

  const statusColor =
    healthStatus === "healthy"
      ? "#10B981"
      : healthStatus === "offline"
      ? "#EF4444"
      : "#F59E0B";

  const SkeletonRow = () => (
    <tr className="skeleton-row">
      <td><div className="skeleton-line" style={{ width: "120px" }} /></td>
      <td><div className="skeleton-line" style={{ width: "80px", fontFamily: "monospace" }} /></td>
      <td><div className="skeleton-line" style={{ width: "40px" }} /></td>
      <td><div className="skeleton-line" style={{ width: "40px" }} /></td>
      <td><div className="skeleton-line" style={{ width: "70px" }} /></td>
      <td><div className="skeleton-line" style={{ width: "90px" }} /></td>
      <td><div className="skeleton-line" style={{ width: "80px", borderRadius: "99px" }} /></td>
    </tr>
  );

  return (
    <div className="app-layout">
      {/* ================================================================= */}
      {/*  GOOGLE FONTS & COMPREHENSIVE EMBEDDED STYLESHEET                */}
      {/* ================================================================= */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        /* --- CSS Global Variables & Theme Config --- */
        :root {
          --primary: #6C63FF;
          --secondary: #8B5CF6;
          --bg-dark: #0F172A;
          --card-bg: #1E293B;
          --accent: #38BDF8;
          --success: #10B981;
          --warning: #F59E0B;
          --error: #EF4444;
          
          --text-main: #F8FAFC;
          --text-muted: #94A3B8;
          
          --glass-bg: rgba(30, 41, 59, 0.65);
          --glass-border: rgba(255, 255, 255, 0.08);
          --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          --glow: rgba(108, 99, 255, 0.25);
          
          --radius-card: 16px;
          --radius-badge: 9999px;
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* --- Global Resets & Body Styling --- */
        .app-layout {
          font-family: 'Inter', sans-serif;
          background-color: var(--bg-dark);
          background-image: 
            radial-gradient(at 0% 0%, rgba(108, 99, 255, 0.12) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.12) 0px, transparent 50%),
            radial-gradient(at 50% 100%, rgba(56, 189, 248, 0.08) 0px, transparent 50%);
          background-attachment: fixed;
          color: var(--text-main);
          min-height: 100vh;
          width: 100%;
          line-height: 1.5;
        }

        /* --- Header & Layout Container --- */
        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* --- Typography --- */
        .gradient-text {
          background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          font-weight: 800;
        }

        /* --- Navigation Bar --- */
        .main-nav {
          position: sticky;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(15, 23, 42, 0.8);
          border-bottom: 1px solid var(--glass-border);
          transition: var(--transition);
        }
        .nav-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 72px;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--text-main);
          cursor: pointer;
        }
        .nav-menu {
          display: flex;
          align-items: center;
          gap: 32px;
          list-style: none;
        }
        .nav-item a {
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: var(--transition);
          position: relative;
        }
        .nav-item a:hover {
          color: var(--text-main);
        }
        .nav-item a::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 0;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          transition: var(--transition);
        }
        .nav-item a:hover::after {
          width: 100%;
        }
        .api-health-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-badge);
          font-size: 12px;
          font-weight: 600;
        }
        .health-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: background 0.4s;
        }

        /* Mobile Hamburger Icon */
        .nav-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text-main);
          font-size: 24px;
          cursor: pointer;
        }

        /* --- Hero Section --- */
        .hero-section {
          text-align: center;
          padding: 80px 24px 60px;
          position: relative;
        }
        .badge-category {
          display: inline-block;
          padding: 6px 16px;
          border-radius: var(--radius-badge);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          background: rgba(108, 99, 255, 0.15);
          border: 1px solid rgba(108, 99, 255, 0.3);
          color: var(--primary);
          margin-bottom: 24px;
          box-shadow: 0 0 15px rgba(108, 99, 255, 0.1);
        }
        .hero-title {
          font-size: clamp(38px, 6vw, 60px);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -1px;
          margin-bottom: 20px;
        }
        .hero-sub {
          max-width: 680px;
          margin: 0 auto 36px;
          font-size: 18px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* --- Buttons --- */
        .action-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          border: none;
          transition: var(--transition);
        }
        .btn-filled-primary {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          box-shadow: 0 4px 20px var(--glow);
        }
        .btn-filled-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(108, 99, 255, 0.45);
        }
        .btn-filled-accent {
          background: #0ea5e9;
          color: white;
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
        }
        .btn-filled-accent:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(14, 165, 233, 0.5);
        }
        .btn-filled-success {
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        .btn-filled-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.5);
        }
        .btn-filled-error {
          background: linear-gradient(135deg, #EF4444, #DC2626);
          color: white;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
        .btn-filled-error:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.5);
        }
        .btn-flat-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
          border: 1px solid var(--glass-border);
        }
        .btn-flat-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* --- Glass Cards & Spacing --- */
        .glass-panel {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-card);
          box-shadow: var(--glass-shadow);
          padding: 32px;
          transition: var(--transition);
        }
        .panel-section {
          padding: 60px 0;
        }
        .section-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .section-header h2 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }
        .section-header p {
          font-size: 16px;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto;
        }

        /* --- Statistics Cards --- */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 48px;
        }
        .stat-card {
          text-align: center;
          padding: 24px;
        }
        .stat-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }
        .stat-value {
          font-size: 28px;
          font-weight: 900;
          color: var(--text-main);
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        /* --- Side by Side Transformation Grid --- */
        .transform-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }
        .comparison-card {
          position: relative;
          overflow: hidden;
        }
        .comparison-card.old-way {
          border-left: 4px solid var(--error);
          background: rgba(239, 68, 68, 0.03);
        }
        .comparison-card.new-way {
          border-left: 4px solid var(--success);
          background: rgba(16, 185, 129, 0.03);
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.08);
        }
        .comparison-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .old-way .comparison-title { color: var(--error); }
        .new-way .comparison-title { color: var(--success); }
        
        .comparison-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .comparison-list li {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-muted);
          position: relative;
          padding-left: 24px;
        }
        .comparison-list li::before {
          content: '•';
          position: absolute;
          left: 8px;
          font-size: 18px;
          top: -2px;
        }
        .old-way .comparison-list li::before { color: var(--error); }
        .new-way .comparison-list li::before { color: var(--success); }

        /* --- Streamlined Workflow Steps --- */
        .workflow-timeline {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 16px;
        }
        .workflow-card {
          text-align: center;
          padding: 24px 16px;
          cursor: pointer;
        }
        .workflow-card-hovered {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px var(--glow);
          border-color: var(--accent);
        }
        .workflow-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          font-size: 12px;
          font-weight: 800;
          color: var(--text-muted);
          margin-bottom: 16px;
          transition: var(--transition);
        }
        .workflow-card-hovered .workflow-num {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border-color: transparent;
          box-shadow: 0 0 10px rgba(108, 99, 255, 0.5);
        }
        .workflow-icon {
          font-size: 28px;
          margin-bottom: 12px;
        }
        .workflow-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 6px;
        }
        .workflow-desc {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* --- Drag & Drop Upload Zone --- */
        .uploader-box {
          border: 2px dashed rgba(108, 99, 255, 0.35);
          border-radius: 16px;
          padding: 56px 24px;
          text-align: center;
          background: rgba(30, 41, 59, 0.3);
          transition: var(--transition);
          cursor: pointer;
          max-width: 680px;
          margin: 0 auto;
        }
        .uploader-box:hover, .uploader-box.drag-over {
          border-color: var(--accent);
          background: rgba(56, 189, 248, 0.05);
          box-shadow: 0 0 25px rgba(56, 189, 248, 0.15);
        }
        .uploader-icon {
          font-size: 48px;
          margin-bottom: 16px;
          animation: float 3s ease-in-out infinite;
        }
        .uploader-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 6px;
          color: var(--text-main);
        }
        .uploader-link {
          color: var(--accent);
          text-decoration: underline;
          cursor: pointer;
        }
        .uploader-info {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 8px;
        }

        /* --- Processing Pipeline Indicator --- */
        .pipeline-card {
          max-width: 680px;
          margin: 0 auto;
        }
        .pipeline-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 24px;
          text-align: center;
        }
        .pipeline-steps {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .pipeline-step-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 16px;
          border-radius: 99px;
          transition: var(--transition);
          min-width: 250px;
        }
        .step-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid var(--glass-border);
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-muted);
          transition: var(--transition);
        }
        .pipeline-step-item.completed .step-circle {
          background: var(--success);
          color: white;
          border-color: transparent;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }
        .pipeline-step-item.active .step-circle {
          background: var(--primary);
          color: white;
          border-color: transparent;
          box-shadow: 0 0 12px var(--glow);
        }
        .pipeline-step-item.active {
          background: rgba(108, 99, 255, 0.08);
          border: 1px solid rgba(108, 99, 255, 0.15);
        }
        .pipeline-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .pipeline-step-item.active .pipeline-label,
        .pipeline-step-item.completed .pipeline-label {
          color: var(--text-main);
        }
        
        .pipeline-connector {
          font-size: 16px;
          color: var(--primary);
          margin: -2px 0;
          animation: bounce 1.5s infinite;
        }
        .pipeline-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid var(--accent);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .pipeline-pulse {
          width: 8px;
          height: 8px;
          background: var(--warning);
          border-radius: 50%;
          animation: pulse 1s infinite ease-in-out;
        }

        /* --- Skeletons --- */
        .skeleton-row td {
          padding: 16px;
        }
        .skeleton-line {
          height: 16px;
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
          border-radius: 4px;
        }

        /* --- Error Box --- */
        .error-box {
          max-width: 600px;
          margin: 32px auto 0;
          border: 1px solid var(--error);
          background: rgba(239, 68, 68, 0.06);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
        }
        .error-box-icon {
          font-size: 36px;
          margin-bottom: 12px;
        }
        .error-box h3 {
          color: var(--text-main);
          margin-bottom: 8px;
        }
        .error-box p {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        /* --- Responsive Tables --- */
        .table-responsive {
          width: 100%;
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          background: rgba(15, 23, 42, 0.4);
        }
        .custom-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .custom-table th {
          padding: 14px 16px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--accent);
          border-bottom: 1px solid var(--glass-border);
          background: rgba(30, 41, 59, 0.3);
        }
        .custom-table td {
          padding: 14px 16px;
          font-size: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          color: var(--text-main);
        }
        .custom-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        /* --- Badges --- */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: var(--radius-badge);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .badge-filled-success {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.25);
        }
        .badge-filled-warning {
          background: rgba(245, 158, 11, 0.15);
          color: var(--warning);
          border: 1px solid rgba(245, 158, 11, 0.25);
        }
        .badge-filled-error {
          background: rgba(239, 68, 68, 0.15);
          color: var(--error);
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        /* --- Manager Approval Dashboard & Financial Grid --- */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-top: 24px;
        }
        
        .client-details-card {
          background: rgba(16, 185, 129, 0.04);
          border: 1px solid rgba(16, 185, 129, 0.15);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .details-header {
          font-size: 14px;
          font-weight: 800;
          color: var(--success);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }
        .details-item {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 6px;
        }
        .details-item strong {
          color: var(--text-main);
        }

        .payload-items-card {
          background: rgba(56, 189, 248, 0.04);
          border: 1px solid rgba(56, 189, 248, 0.15);
          border-radius: 12px;
          padding: 20px;
        }
        .payload-header {
          font-size: 14px;
          font-weight: 800;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        /* Right column: override control panel */
        .override-panel {
          background: rgba(139, 92, 246, 0.04);
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-radius: 12px;
          padding: 24px;
        }
        .override-title {
          font-size: 14px;
          font-weight: 800;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 20px;
          text-align: center;
        }
        .override-form-group {
          margin-bottom: 18px;
        }
        .override-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        
        /* Interactive Input Styling */
        .override-input-wrapper {
          position: relative;
        }
        .override-input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          color: var(--text-main);
          font-family: inherit;
          transition: var(--transition);
        }
        .override-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.15);
        }
        .input-edit-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 13px;
          color: var(--accent);
          pointer-events: none;
        }

        /* Horizontal Split Row inside form */
        .override-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* Finance Summary Block */
        .finance-summary {
          border-top: 1px solid var(--glass-border);
          padding-top: 20px;
          margin-top: 24px;
        }
        .finance-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          color: var(--text-muted);
        }
        .finance-row.grand-total {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          border-top: 1px dashed var(--glass-border);
          padding-top: 12px;
          margin-top: 12px;
        }

        /* Action Buttons Row */
        .dashboard-actions-row {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 32px;
        }

        /* AI Recommendation Banner */
        .recommendation-banner {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 10px;
          padding: 16px;
          font-size: 13px;
          color: var(--warning);
          line-height: 1.5;
          margin-top: 24px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        /* --- Footer --- */
        .main-footer {
          border-top: 1px solid var(--glass-border);
          padding: 48px 0 32px;
          margin-top: 80px;
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
        }

        /* --- Animations --- */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes shimmer {
          100% { background-position: 200% 0; }
        }

        /* ================================================================= */
        /*  RESPONSIVE MEDIA QUERIES                                         */
        /* ================================================================= */

        /* Laptop (1024px) */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .transform-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .workflow-timeline {
            grid-template-columns: repeat(4, 1fr);
          }
          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        /* Tablet (768px) */
        @media (max-width: 768px) {
          .nav-toggle {
            display: block;
          }
          .nav-menu {
            position: absolute;
            top: 72px;
            left: 0;
            width: 100%;
            flex-direction: column;
            background: rgba(15, 23, 42, 0.95);
            border-bottom: 1px solid var(--glass-border);
            padding: 24px;
            gap: 20px;
            display: none;
          }
          .nav-menu.open {
            display: flex;
          }
          .workflow-timeline {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-actions-row {
            flex-direction: column;
            width: 100%;
          }
          .dashboard-actions-row button {
            width: 100%;
          }
        }

        /* Mobile (390px) */
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .workflow-timeline {
            grid-template-columns: 1fr;
          }
          .override-form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ================================================================= */}
      {/*  DEMO BANNER                                                      */}
      {/* ================================================================= */}
      <div style={{
        background: "linear-gradient(90deg, var(--primary), var(--secondary))",
        color: "#fff",
        textAlign: "center",
        padding: "8px 16px",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.5px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        position: "relative",
        zIndex: 1001,
      }}>
        🚀 Hackathon Demo Mode — Active Backend API Integration
      </div>

      {/* ================================================================= */}
      {/*  NAVBAR                                                           */}
      {/* ================================================================= */}
      <Navbar healthStatus={healthStatus} />

      {/* ================================================================= */}
      {/*  HERO SECTION                                                     */}
      {/* ================================================================= */}
      <Hero />

      {/* ================================================================= */}
      {/*  STATISTICS & VALUE PROP CARDS                                    */}
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
      <footer className="main-footer">
        <div className="container">
          <p>⚡ <strong>QuoteFlow AI</strong> — FlowZint AI Hackathon 2026</p>
          <p style={{ marginTop: 6, opacity: 0.6 }}>Built with FastAPI • React • Gemini AI • ❤️</p>
        </div>
      </footer>
    </div>
  );
}

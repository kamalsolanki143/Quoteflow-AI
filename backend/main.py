"""
QuoteFlow AI - Backend API Server
==================================
FastAPI-powered backend for the AI-driven RFQ-to-Quote automation system.

This module serves as the main entry point for the QuoteFlow AI backend.
It provides health checks, project metadata, and hosts all RFQ processing
endpoints.

Complete Workflow:
  Upload RFQ → Text Extraction → Gemini AI Extraction → Structured JSON
  → Inventory Validation → Quote Generation → Manager Approval → Response

Author: QuoteFlow AI Team
Hackathon: FlowZint AI Hackathon 2026
"""

import json
import logging
import os
import sys
import uuid
from datetime import datetime, timezone

# Ensure the parent directory of the current file is in sys.path.
# This guarantees that 'backend' is resolved as a module/package regardless of
# whether uvicorn is started from the repository root or from inside the backend directory.
_base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _base_dir not in sys.path:
    sys.path.insert(0, _base_dir)

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ---------------------------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%SZ",
)
logger = logging.getLogger("quoteflow")

# ---------------------------------------------------------------------------
# Application Configuration
# ---------------------------------------------------------------------------

APP_TITLE = "QuoteFlow AI"
APP_DESCRIPTION = (
    "AI-powered RFQ to Quote Automation Agent — automatically converts "
    "Request For Quotation documents into professional, accurate quotations."
)
APP_VERSION = "1.0.0-mvp"

# ---------------------------------------------------------------------------
# FastAPI Application Instance
# ---------------------------------------------------------------------------

app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    docs_url="/docs",          # Swagger UI
    redoc_url="/redoc",        # ReDoc UI
    openapi_url="/openapi.json",
)

# ---------------------------------------------------------------------------
# CORS Middleware — allow the React frontend to communicate with the backend
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Include Routers — Backend Integration Module
# ---------------------------------------------------------------------------
# Import is deferred inside a try/except so that the server can still start
# even if a route file has a syntax error during development.

try:
    from backend.routes.upload import router as upload_router
    from backend.routes.quote import router as quote_router
    from backend.routes.approval import router as approval_router

    app.include_router(upload_router)
    app.include_router(quote_router)
    app.include_router(approval_router)
    logger.info("All route modules loaded successfully.")
except Exception as _route_exc:
    logger.error("Failed to load route modules: %s", _route_exc)
    raise

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# Resolve the path to the inventory database relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INVENTORY_PATH = os.path.join(BASE_DIR, "database", "inventory.json")


def _load_inventory() -> dict:
    """Load the JSON inventory database from disk."""
    with open(INVENTORY_PATH, "r", encoding="utf-8") as fh:
        return json.load(fh)


def _server_timestamp() -> str:
    """Return the current UTC timestamp in ISO-8601 format."""
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Routes — Root & Metadata
# ---------------------------------------------------------------------------

@app.get(
    "/",
    tags=["General"],
    summary="Root endpoint",
    response_description="Welcome message and project metadata",
)
async def root():
    """
    Root endpoint — returns a welcome message along with key project metadata.
    Useful for verifying the API is reachable and correctly deployed.
    """
    return {
        "message": f"Welcome to {APP_TITLE}",
        "description": APP_DESCRIPTION,
        "version": APP_VERSION,
        "status": "operational",
        "timestamp": _server_timestamp(),
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "upload_rfq": "/api/v1/rfq/upload",
            "generate_quote": "/api/v1/quote/generate",
            "inventory": "/api/v1/inventory",
            "approve_quote": "/api/v1/quote/approve",
            "reject_quote": "/api/v1/quote/reject",
        },
    }


# ---------------------------------------------------------------------------
# Routes — Health Check
# ---------------------------------------------------------------------------

@app.get(
    "/health",
    tags=["General"],
    summary="Health check",
    response_description="Service health status",
)
async def health_check():
    """
    Health-check endpoint for monitoring and load-balancer probes.
    Returns service status, uptime metadata, and component readiness.
    """
    # Verify inventory DB is accessible
    inventory_ok = os.path.isfile(INVENTORY_PATH)

    return {
        "status": "healthy" if inventory_ok else "degraded",
        "service": APP_TITLE,
        "version": APP_VERSION,
        "timestamp": _server_timestamp(),
        "components": {
            "api": "operational",
            "inventory_db": "connected" if inventory_ok else "unavailable",
            "ai_engine": "ready",
        },
    }


# ---------------------------------------------------------------------------
# Routes — Inventory
# ---------------------------------------------------------------------------

@app.get(
    "/api/v1/inventory",
    tags=["Inventory"],
    summary="List all inventory products",
    response_description="Full product catalogue with stock and pricing",
)
async def get_inventory():
    """
    Returns the full product inventory including SKU, stock levels,
    and unit pricing.  Used by the quoting engine to validate product
    availability and calculate line-item costs.
    """
    try:
        inventory = _load_inventory()
        return {
            "success": True,
            "data": inventory,
            "product_count": len(inventory.get("products", [])),
            "timestamp": _server_timestamp(),
        }
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Inventory database not found. Please ensure inventory.json exists.",
        )
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Inventory database is corrupted.",
        )


# ---------------------------------------------------------------------------
# Application Startup Event
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def on_startup():
    """Log a startup banner and verify all components on server start."""
    logger.info("=" * 60)
    logger.info("  %s v%s", APP_TITLE, APP_VERSION)
    logger.info("  AI-Powered RFQ → Quote Automation")
    logger.info("  FlowZint AI Hackathon 2026")
    logger.info("=" * 60)
    logger.info("  Inventory DB : %s", INVENTORY_PATH)
    logger.info("  Inventory OK : %s", os.path.isfile(INVENTORY_PATH))
    logger.info("  Docs         : http://localhost:8000/docs")
    logger.info("=" * 60)


# ---------------------------------------------------------------------------
# Run with: uvicorn backend.main:app --reload
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    from dotenv import load_dotenv
    load_dotenv()
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info("Starting server on %s:%s", host, port)
    uvicorn.run("backend.main:app", host=host, port=port, reload=os.getenv("RELOAD", "false").lower() == "true")

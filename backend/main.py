"""
QuoteFlow AI - Backend API Server
==================================
FastAPI-powered backend for the AI-driven RFQ-to-Quote automation system.

This module serves as the main entry point for the QuoteFlow AI backend.
It provides health checks, project metadata, and will host all RFQ processing
endpoints as the project evolves.

Author: QuoteFlow AI Team
Hackathon: FlowZint AI Hackathon 2026
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timezone
import json
import os
import uuid

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
    allow_origins=[
        "http://localhost:3000",   # React dev server (CRA)
        "http://localhost:5173",   # React dev server (Vite)
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
# Routes — RFQ Upload
# ---------------------------------------------------------------------------

@app.post(
    "/api/v1/rfq/upload",
    tags=["RFQ Processing"],
    summary="Upload an RFQ document",
    response_description="Extracted product data from the uploaded RFQ",
)
async def upload_rfq(file: UploadFile = File(...)):
    """
    Accepts an RFQ document (PDF or TXT) and extracts product line items.

    In the MVP this performs a simple text-based extraction.
    Future versions will integrate Gemini AI for intelligent parsing.
    """
    # Validate file type
    allowed_types = [
        "application/pdf",
        "text/plain",
        "application/octet-stream",
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. "
                   f"Accepted types: PDF, TXT.",
        )

    # Read file contents
    content = await file.read()
    text_content = content.decode("utf-8", errors="ignore")

    # Generate a unique RFQ tracking ID
    rfq_id = f"RFQ-{uuid.uuid4().hex[:8].upper()}"

    return {
        "success": True,
        "rfq_id": rfq_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "size_bytes": len(content),
        "extracted_text_preview": text_content[:500],
        "message": "RFQ uploaded successfully. Ready for AI extraction.",
        "timestamp": _server_timestamp(),
    }


# ---------------------------------------------------------------------------
# Routes — Quote Generation
# ---------------------------------------------------------------------------

@app.post(
    "/api/v1/quote/generate",
    tags=["Quote Generation"],
    summary="Generate a quotation from extracted RFQ data",
    response_description="Complete quotation with line items and totals",
)
async def generate_quote(rfq_data: dict):
    """
    Accepts structured RFQ data (product names + quantities) and generates
    a professional quotation by cross-referencing the inventory database.

    Request body example::

        {
            "rfq_id": "RFQ-ABC12345",
            "items": [
                {"product": "HP Laptop", "quantity": 50},
                {"product": "Dell Monitor", "quantity": 20}
            ]
        }
    """
    items = rfq_data.get("items", [])
    rfq_id = rfq_data.get("rfq_id", f"RFQ-{uuid.uuid4().hex[:8].upper()}")

    if not items:
        raise HTTPException(
            status_code=400,
            detail="No items provided in the RFQ data.",
        )

    # Load inventory for price & stock lookup
    try:
        inventory = _load_inventory()
    except Exception:
        raise HTTPException(status_code=503, detail="Inventory unavailable.")

    # Build a lookup map: lowercase product name → product record
    product_map = {
        p["name"].lower(): p for p in inventory.get("products", [])
    }

    # Process each requested line item
    quote_lines = []
    unavailable_items = []
    subtotal = 0.0

    for item in items:
        product_name = item.get("product", "").strip()
        quantity = int(item.get("quantity", 0))
        key = product_name.lower()

        if key not in product_map:
            unavailable_items.append(product_name)
            continue

        product = product_map[key]
        unit_price = product["unit_price"]
        available_stock = product["stock"]
        fulfilled_qty = min(quantity, available_stock)
        line_total = round(fulfilled_qty * unit_price, 2)
        subtotal += line_total

        quote_lines.append({
            "product": product["name"],
            "sku": product["sku"],
            "requested_qty": quantity,
            "available_qty": available_stock,
            "fulfilled_qty": fulfilled_qty,
            "unit_price": unit_price,
            "line_total": line_total,
            "status": "fulfilled" if fulfilled_qty == quantity else "partial",
        })

    # Calculate totals
    tax_rate = 0.18  # 18 % GST (India)
    tax_amount = round(subtotal * tax_rate, 2)
    grand_total = round(subtotal + tax_amount, 2)

    # Build the quote ID
    quote_id = f"QT-{uuid.uuid4().hex[:8].upper()}"

    return {
        "success": True,
        "quote_id": quote_id,
        "rfq_id": rfq_id,
        "line_items": quote_lines,
        "unavailable_items": unavailable_items,
        "pricing": {
            "subtotal": subtotal,
            "tax_rate": f"{int(tax_rate * 100)}%",
            "tax_amount": tax_amount,
            "grand_total": grand_total,
            "currency": "INR",
        },
        "status": "pending_approval",
        "generated_at": _server_timestamp(),
        "valid_until": "7 days from generation",
        "message": "Quotation generated successfully. Awaiting manager approval.",
    }


# ---------------------------------------------------------------------------
# Application Startup Event
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def on_startup():
    """Log a banner on server start for quick visual confirmation."""
    print("=" * 60)
    print(f"  {APP_TITLE} v{APP_VERSION}")
    print("  AI-Powered RFQ → Quote Automation")
    print("  FlowZint AI Hackathon 2026")
    print("=" * 60)
    print(f"  Inventory DB : {INVENTORY_PATH}")
    print(f"  Docs         : http://localhost:8000/docs")
    print("=" * 60)


# ---------------------------------------------------------------------------
# Run with: uvicorn backend.main:app --reload
# ---------------------------------------------------------------------------

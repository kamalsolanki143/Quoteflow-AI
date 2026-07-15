"""
QuoteFlow AI — Application Constants
======================================
Centralised constants for file validation, pricing rules, stock thresholds,
and logging identifiers.  All values are sourced from the inventory.json
``validation_rules`` block so there is a single source of truth.

Author : QuoteFlow AI Team
"""

# ---------------------------------------------------------------------------
# File Upload Validation
# ---------------------------------------------------------------------------

#: Supported MIME types for uploaded RFQ documents
SUPPORTED_FILE_TYPES: list[str] = [
    "application/pdf",
    "text/plain",
    "application/octet-stream",   # browsers sometimes send .txt with this
]

#: Human-readable labels for the allowed file types (used in error messages)
SUPPORTED_FILE_LABELS: str = "PDF (.pdf) or Plain Text (.txt)"

#: Maximum allowed upload size in bytes (10 MB)
MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB

#: Minimum file size in bytes — reject truly empty files
MIN_FILE_SIZE_BYTES: int = 1

# ---------------------------------------------------------------------------
# Inventory / Stock Thresholds
# ---------------------------------------------------------------------------

#: GST rate applied to all quotations (18 % — standard Indian B2B GST)
GST_RATE: float = 0.18

#: Number of days a generated quotation remains valid
QUOTE_VALIDITY_DAYS: int = 7

#: Maximum quantity that can be requested for a single line item
MAX_QUOTE_QUANTITY: int = 500

#: Maximum number of revision cycles allowed per quotation
MAX_REVISION_CYCLES: int = 3

# Stock-status labels (used in validation responses)
STOCK_STATUS_AVAILABLE: str = "Available"
STOCK_STATUS_LOW: str = "Low Stock"
STOCK_STATUS_OUT: str = "Out Of Stock"
STOCK_STATUS_UNKNOWN: str = "Unknown Product"

# ---------------------------------------------------------------------------
# Quote / Approval Status
# ---------------------------------------------------------------------------

QUOTE_STATUS_PENDING: str = "pending_approval"
QUOTE_STATUS_APPROVED: str = "approved"
QUOTE_STATUS_REJECTED: str = "rejected"

# ---------------------------------------------------------------------------
# Logging Event Labels
# ---------------------------------------------------------------------------

LOG_UPLOAD_STARTED: str = "UPLOAD_STARTED"
LOG_UPLOAD_SUCCESS: str = "UPLOAD_SUCCESS"
LOG_EXTRACTION_STARTED: str = "EXTRACTION_STARTED"
LOG_EXTRACTION_COMPLETED: str = "EXTRACTION_COMPLETED"
LOG_INVENTORY_VALIDATION: str = "INVENTORY_VALIDATION"
LOG_QUOTE_GENERATED: str = "QUOTE_GENERATED"
LOG_ERROR: str = "ERROR"

# ---------------------------------------------------------------------------
# Currency
# ---------------------------------------------------------------------------

CURRENCY: str = "INR"

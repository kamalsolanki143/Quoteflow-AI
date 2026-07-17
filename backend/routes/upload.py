"""
QuoteFlow AI — Upload Route
=============================
Implements ``POST /api/v1/rfq/upload``.

Full integration pipeline:
  1. Validate file type and size
  2. Extract plain text (TXT decode / PDF via pypdf)
  3. Call Gemini via ``gemini_service.call_gemini_extractor()``
  4. Normalise items via ``rfq_parser.parse_extracted_items()``
  5. Validate items against inventory via ``inventory_service.validate_items()``
  6. Return structured JSON to the frontend

The response structure is fully backward-compatible with the existing
``main.py`` skeleton (same top-level keys: ``success``, ``rfq_id``,
``filename``, ``content_type``, ``size_bytes``, ``timestamp``).

Author : QuoteFlow AI Team
"""

from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.services.gemini_service import call_gemini_extractor
from backend.services.inventory_service import load_inventory, validate_items
from backend.services.rfq_parser import parse_extracted_items
from backend.utils.constants import (
    LOG_UPLOAD_STARTED,
    LOG_UPLOAD_SUCCESS,
    LOG_ERROR,
    MAX_FILE_SIZE_BYTES,
    MIN_FILE_SIZE_BYTES,
    SUPPORTED_FILE_TYPES,
    SUPPORTED_FILE_LABELS,
)
from backend.utils.helpers import extract_text_from_file, server_timestamp

logger = logging.getLogger("quoteflow")

router = APIRouter(prefix="/api/v1/rfq")


@router.post(
    "/upload",
    tags=["RFQ Processing"],
    summary="Upload an RFQ document",
    response_description="Structured RFQ data with inventory validation",
)
async def upload_rfq(file: UploadFile = File(...)):
    """
    Accept an RFQ document (PDF or TXT) and run the full extraction pipeline.

    **Workflow:**
    1. Validate file type and size.
    2. Read file bytes and extract plain text.
    3. Send text to Gemini via the existing ``extract_rfq()`` function.
    4. Parse and normalise the extracted items.
    5. Validate each item against ``inventory.json``.
    6. Return structured JSON with per-item stock status and alternatives.

    **Request:** ``multipart/form-data`` with a ``file`` field.

    **Supported formats:** PDF (`.pdf`), Plain Text (`.txt`).
    """
    rfq_id = f"RFQ-{uuid.uuid4().hex[:8].upper()}"

    logger.info(
        "%s | rfq_id=%s | filename=%s | content_type=%s",
        LOG_UPLOAD_STARTED,
        rfq_id,
        file.filename,
        file.content_type,
    )

    # ------------------------------------------------------------------
    # 1. File type validation
    # ------------------------------------------------------------------
    content_type = file.content_type or ""
    filename = file.filename or ""

    # Normalise octet-stream for .txt files (some browsers do this)
    if content_type == "application/octet-stream" and filename.lower().endswith(".txt"):
        content_type = "text/plain"

    if content_type not in SUPPORTED_FILE_TYPES and not filename.lower().endswith(
        (".pdf", ".txt")
    ):
        logger.error(
            "%s | rfq_id=%s | Unsupported file type: %s",
            LOG_ERROR,
            rfq_id,
            file.content_type,
        )
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type: '{file.content_type}'. "
                f"Accepted formats: {SUPPORTED_FILE_LABELS}."
            ),
        )

    # ------------------------------------------------------------------
    # 2. Read file bytes + size validation
    # ------------------------------------------------------------------
    try:
        content: bytes = await file.read()
    except Exception as exc:
        logger.error("%s | rfq_id=%s | Failed to read file: %s", LOG_ERROR, rfq_id, exc)
        raise HTTPException(
            status_code=400,
            detail=f"Failed to read uploaded file: {exc}",
        )

    file_size = len(content)

    if file_size < MIN_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty. Please provide a valid RFQ document.",
        )

    if file_size > MAX_FILE_SIZE_BYTES:
        max_mb = MAX_FILE_SIZE_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=(
                f"File size ({file_size / 1024 / 1024:.1f} MB) exceeds the "
                f"maximum allowed size of {max_mb} MB."
            ),
        )

    # ------------------------------------------------------------------
    # 3. Text extraction
    # ------------------------------------------------------------------
    try:
        rfq_text = extract_text_from_file(content, content_type, filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        logger.error("%s | rfq_id=%s | Text extraction failed: %s", LOG_ERROR, rfq_id, exc)
        raise HTTPException(status_code=422, detail=str(exc))

    if not rfq_text.strip():
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not extract any text from the uploaded document. "
                "If this is a scanned PDF, please provide a text-based PDF or .txt file."
            ),
        )

    # ------------------------------------------------------------------
    # 4. Gemini AI extraction
    # ------------------------------------------------------------------
    try:
        extracted = call_gemini_extractor(rfq_text)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        logger.error("%s | rfq_id=%s | Gemini extraction failed: %s", LOG_ERROR, rfq_id, exc)
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        )

    # ------------------------------------------------------------------
    # 5. Parse and normalise extracted items
    # ------------------------------------------------------------------
    try:
        normalised_items = parse_extracted_items(extracted)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # ------------------------------------------------------------------
    # 6. Inventory validation
    # ------------------------------------------------------------------
    try:
        inventory = load_inventory()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inventory error: {exc}")

    validation_results = validate_items(normalised_items, inventory)

    logger.info(
        "%s | rfq_id=%s | %d item(s) validated",
        LOG_UPLOAD_SUCCESS,
        rfq_id,
        len(validation_results),
    )

    # ------------------------------------------------------------------
    # 7. Build response
    # ------------------------------------------------------------------
    return {
        "success": True,
        "rfq_id": rfq_id,
        "filename": filename,
        "content_type": file.content_type,
        "size_bytes": file_size,
        "timestamp": server_timestamp(),
        # Gemini extraction metadata
        "extraction": {
            "customer_name": extracted.get("customer_name"),
            "customer_contact": extracted.get("customer_contact"),
            "industry": extracted.get("industry"),
            "delivery_location": extracted.get("delivery_location"),
            "delivery_deadline": extracted.get("delivery_deadline"),
            "payment_terms": extracted.get("payment_terms"),
            "budget_mentioned": extracted.get("budget_mentioned"),
            "missing_fields": extracted.get("missing_fields", []),
            "confidence": extracted.get("confidence"),
            "notes": extracted.get("notes"),
        },
        # Normalised items ready for quote generation
        "items": [
            {"product": it["product"], "quantity": it["quantity"], "unit": it["unit"]}
            for it in normalised_items
        ],
        # Per-item inventory validation results
        "inventory_validation": [r.model_dump() for r in validation_results],
        "message": (
            f"RFQ processed successfully. "
            f"{len(normalised_items)} item(s) extracted. "
            "Review inventory status and proceed to quote generation."
        ),
    }

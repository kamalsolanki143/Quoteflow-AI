"""
QuoteFlow AI — Quote Route
============================
Implements ``POST /api/v1/quote/generate``.

Accepts structured RFQ data from the frontend (rfq_id + items list),
loads inventory prices, and returns a complete quotation with:
  - Per-line unit price, fulfilled quantity, line total, stock status
  - Subtotal, GST (18 %), and grand total
  - Status: pending_approval (ready for manager review)

All prices are read from ``inventory.json`` — never hardcoded.

Author : QuoteFlow AI Team
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from backend.models.quote import QuoteGenerateRequest
from backend.services.inventory_service import load_inventory
from backend.services.quote_generator import generate_quote
from backend.utils.constants import LOG_ERROR

logger = logging.getLogger("quoteflow")

router = APIRouter(prefix="/api/v1/quote")


@router.post(
    "/generate",
    tags=["Quote Generation"],
    summary="Generate a quotation from extracted RFQ data",
    response_description="Complete quotation with line items, GST, and grand total",
)
async def generate_quote_endpoint(rfq_data: dict):
    """
    Generate a professional quotation from structured RFQ data.

    Accepts the payload returned by ``/api/v1/rfq/upload`` (or any
    ``{rfq_id, items}`` payload) and cross-references each product against
    the live inventory to produce accurate, priced line items.

    **Request body example:**

    ```json
    {
        "rfq_id": "RFQ-ABC12345",
        "items": [
            {"product": "HP Laptop", "quantity": 50},
            {"product": "Dell Monitor", "quantity": 20}
        ]
    }
    ```

    **Response includes:**
    - Per-line: product name, SKU, requested qty, fulfilled qty, unit price, line total, stock status
    - Pricing summary: subtotal, GST (18 %), grand total in INR
    - Quote status: ``pending_approval``
    """
    # ------------------------------------------------------------------
    # 1. Validate request body using Pydantic model
    # ------------------------------------------------------------------
    try:
        request = QuoteGenerateRequest(**rfq_data)
    except ValidationError as exc:
        errors = [f"{e['loc'][-1]}: {e['msg']}" for e in exc.errors()]
        raise HTTPException(
            status_code=422,
            detail=f"Invalid request: {'; '.join(errors)}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Malformed request body: {exc}",
        )

    # ------------------------------------------------------------------
    # 2. Load inventory
    # ------------------------------------------------------------------
    try:
        inventory = load_inventory()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.error("%s | Inventory load failed: %s", LOG_ERROR, exc)
        raise HTTPException(status_code=500, detail=f"Inventory error: {exc}")

    # ------------------------------------------------------------------
    # 3. Validate inputs
    # ------------------------------------------------------------------
    items_payload = []
    for item in request.items:
        items_payload.append(
            {
                "product": item.product,
                "quantity": item.quantity,
                "flags": [],
            }
        )

    if not items_payload:
        raise HTTPException(
            status_code=400,
            detail="No valid items provided for quote generation.",
        )

    # ------------------------------------------------------------------
    # 4. Generate quote
    # ------------------------------------------------------------------
    try:
        quote = generate_quote(
            rfq_id=request.rfq_id,
            items=items_payload,
            inventory=inventory,
        )
    except Exception as exc:
        logger.error("%s | Quote generation failed: %s", LOG_ERROR, exc)
        raise HTTPException(
            status_code=500,
            detail=f"Quote generation error: {exc}",
        )

    return quote

"""
QuoteFlow AI — Quote Generator Service
========================================
Generates a fully-priced quotation by cross-referencing normalised RFQ
items against the inventory database.

All prices are always read from ``inventory.json`` — never hardcoded.

Public API
----------
generate_quote(rfq_id, items, inventory) -> dict
    Build a complete quote response dict.

Author : QuoteFlow AI Team
"""

from __future__ import annotations

import logging
import uuid
from typing import Optional

from backend.utils.constants import (
    GST_RATE,
    QUOTE_VALIDITY_DAYS,
    QUOTE_STATUS_PENDING,
    STOCK_STATUS_AVAILABLE,
    STOCK_STATUS_LOW,
    STOCK_STATUS_OUT,
    STOCK_STATUS_UNKNOWN,
    CURRENCY,
    LOG_QUOTE_GENERATED,
    LOG_ERROR,
)
from backend.utils.helpers import fuzzy_match_product, server_timestamp
from backend.services.inventory_service import determine_stock_status

logger = logging.getLogger("quoteflow")


def generate_quote(
    rfq_id: str,
    items: list[dict],
    inventory: dict,
) -> dict:
    """
    Build a complete quotation from normalised RFQ items and inventory data.

    Parameters
    ----------
    rfq_id : str
        The RFQ tracking ID to embed in the quote.
    items : list[dict]
        Normalised item list — each dict has ``product``, ``quantity``, ``flags``.
    inventory : dict
        Full inventory dict loaded from inventory.json.

    Returns
    -------
    dict
        Complete quote response payload ready to be returned to the frontend.
    """
    product_list: list[dict] = inventory.get("products", [])
    quote_lines: list[dict] = []
    unavailable_items: list[str] = []
    subtotal: float = 0.0

    for item in items:
        product_name: str = item.get("product", "").strip()
        requested_qty: Optional[int] = item.get("quantity")

        # Fuzzy match against inventory
        matched = fuzzy_match_product(product_name, product_list)

        if matched is None:
            logger.info(
                "%s | '%s' not found in inventory — marked unavailable",
                LOG_QUOTE_GENERATED,
                product_name,
            )
            unavailable_items.append(product_name)
            continue

        stock_status = determine_stock_status(matched, requested_qty)
        available_stock: int = matched.get("stock", 0)
        unit_price: float = matched.get("unit_price", 0.0)

        # Use requested qty; fall back to 1 if missing
        qty_to_fulfil: int = requested_qty if requested_qty and requested_qty > 0 else 1
        fulfilled_qty: int = min(qty_to_fulfil, available_stock)
        line_total: float = round(fulfilled_qty * unit_price, 2)
        subtotal += line_total

        if available_stock == 0:
            fulfillment_status = "unavailable"
        elif fulfilled_qty < qty_to_fulfil:
            fulfillment_status = "partial"
        else:
            fulfillment_status = "fulfilled"

        quote_lines.append(
            {
                "product": matched["name"],
                "sku": matched["sku"],
                "requested_qty": requested_qty,
                "available_qty": available_stock,
                "fulfilled_qty": fulfilled_qty,
                "unit_price": unit_price,
                "line_total": line_total,
                "stock_status": stock_status,
                "fulfillment_status": fulfillment_status,
            }
        )

    # Financial calculations — always from inventory data, never hardcoded
    tax_rate: float = inventory.get("validation_rules", {}).get("gst_rate", GST_RATE)
    tax_amount: float = round(subtotal * tax_rate, 2)
    grand_total: float = round(subtotal + tax_amount, 2)
    validity_days: int = inventory.get("validation_rules", {}).get(
        "quote_validity_days", QUOTE_VALIDITY_DAYS
    )

    quote_id: str = f"QT-{uuid.uuid4().hex[:8].upper()}"
    generated_at: str = server_timestamp()

    logger.info(
        "%s | quote_id=%s | rfq_id=%s | lines=%d | subtotal=%.2f | grand_total=%.2f",
        LOG_QUOTE_GENERATED,
        quote_id,
        rfq_id,
        len(quote_lines),
        subtotal,
        grand_total,
    )

    return {
        "success": True,
        "quote_id": quote_id,
        "rfq_id": rfq_id,
        "line_items": quote_lines,
        "unavailable_items": unavailable_items,
        "pricing": {
            "subtotal": round(subtotal, 2),
            "tax_rate": f"{int(tax_rate * 100)}%",
            "tax_amount": tax_amount,
            "grand_total": grand_total,
            "currency": CURRENCY,
        },
        "status": QUOTE_STATUS_PENDING,
        "generated_at": generated_at,
        "valid_until": f"{validity_days} days from generation",
        "message": "Quotation generated successfully. Awaiting manager approval.",
    }

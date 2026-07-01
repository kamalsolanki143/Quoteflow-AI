"""
QuoteFlow AI — RFQ Parser
===========================
Normalises the structured JSON returned by ``rfq_extractor.extract_rfq()``
into a clean, consistent list of ``{product, quantity, flags}`` dicts that
can be passed directly to the inventory validation and quote generation
services.

The extractor schema uses ``product_name`` and ``quantity`` (possibly null);
the quote service expects ``product`` and ``quantity``.  This module bridges
that gap.

Public API
----------
parse_extracted_items(extracted_json) -> list[dict]
    Convert Gemini extraction output → normalised item list.

Author : QuoteFlow AI Team
"""

from __future__ import annotations

import logging
from typing import Optional

logger = logging.getLogger("quoteflow")


def parse_extracted_items(extracted_json: dict) -> list[dict]:
    """
    Normalise the Gemini extraction result into a flat item list.

    Each output dict has:
    - ``product``  (str)        — canonical product name
    - ``quantity`` (int | None) — requested quantity; None if not specified
    - ``unit``     (str)        — unit of measure (for reference)
    - ``flags``    (list[str])  — item-level flags from the extractor

    Parameters
    ----------
    extracted_json : dict
        The dict returned by ``rfq_extractor.extract_rfq()``.

    Returns
    -------
    list[dict]
        Normalised item list ready for inventory validation / quoting.

    Raises
    ------
    ValueError
        If *extracted_json* contains no items or is not a valid dict.
    """
    if not isinstance(extracted_json, dict):
        raise ValueError(
            "Gemini extraction result is not a valid dictionary. "
            "Cannot parse items."
        )

    raw_items: list[dict] = extracted_json.get("items", [])

    if not raw_items:
        raise ValueError(
            "No items were extracted from the RFQ document. "
            "The document may be blank, image-only, or unrecognisable as an RFQ."
        )

    normalised: list[dict] = []

    for raw in raw_items:
        product_name: str = (raw.get("product_name") or "").strip()
        if not product_name:
            logger.warning("Skipping item with missing product_name: %s", raw)
            continue

        raw_qty = raw.get("quantity")
        quantity: Optional[int] = _parse_quantity(raw_qty)

        normalised.append(
            {
                "product": product_name,
                "quantity": quantity,
                "unit": raw.get("unit") or "",
                "flags": raw.get("flags") or [],
            }
        )

    if not normalised:
        raise ValueError(
            "All extracted items were invalid (missing product names). "
            "Please check the RFQ document."
        )

    return normalised


def _parse_quantity(raw_qty) -> Optional[int]:
    """
    Safely coerce the raw quantity value to a positive int or None.

    The Gemini schema declares quantity as NUMBER which may be a float
    (e.g. 2.0) or explicitly null for budget-only / missing-quantity items.
    """
    if raw_qty is None:
        return None
    try:
        qty = int(float(raw_qty))
        return qty if qty > 0 else None
    except (TypeError, ValueError):
        return None

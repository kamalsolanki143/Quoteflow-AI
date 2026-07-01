"""
QuoteFlow AI — Inventory Service
==================================
Handles loading the inventory database and validating extracted RFQ items
against current stock levels.

Public API
----------
load_inventory() -> dict
    Load and return the full inventory JSON.

get_product_list(inventory) -> list[dict]
    Extract the products list from the inventory dict.

determine_stock_status(product, requested_qty) -> str
    Classify stock status for a matched product + requested quantity.

find_alternative(excluded_name, product_list) -> dict | None
    Find a suitable in-stock alternative when a product is unavailable.

validate_items(items, inventory) -> list[InventoryValidationResult]
    Cross-reference a list of extracted items against the inventory.

Author : QuoteFlow AI Team
"""

from __future__ import annotations

import json
import logging
import os
from typing import Optional

from backend.models.inventory import InventoryValidationResult
from backend.utils.constants import (
    STOCK_STATUS_AVAILABLE,
    STOCK_STATUS_LOW,
    STOCK_STATUS_OUT,
    STOCK_STATUS_UNKNOWN,
    LOG_INVENTORY_VALIDATION,
    LOG_ERROR,
)
from backend.utils.helpers import fuzzy_match_product

logger = logging.getLogger("quoteflow")

# ---------------------------------------------------------------------------
# Inventory Path Resolution
# ---------------------------------------------------------------------------

# The path used here must match the one already established in main.py:
#   BASE_DIR = dirname(dirname(abspath(__file__)))   →  project root
#   INVENTORY_PATH = BASE_DIR / "database" / "inventory.json"
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INVENTORY_PATH = os.path.join(_BASE_DIR, "database", "inventory.json")


# ---------------------------------------------------------------------------
# Load Inventory
# ---------------------------------------------------------------------------


def load_inventory() -> dict:
    """
    Load the inventory JSON from disk.

    Returns
    -------
    dict
        The full inventory dictionary with ``products``, ``metadata``, etc.

    Raises
    ------
    FileNotFoundError
        If ``inventory.json`` does not exist at the expected path.
    json.JSONDecodeError
        If the file is present but contains invalid JSON.
    """
    if not os.path.isfile(INVENTORY_PATH):
        logger.error(
            "%s | Inventory file not found at: %s", LOG_ERROR, INVENTORY_PATH
        )
        raise FileNotFoundError(
            f"Inventory database not found at {INVENTORY_PATH}. "
            "Ensure inventory.json is present in the database/ directory."
        )

    with open(INVENTORY_PATH, "r", encoding="utf-8") as fh:
        try:
            return json.load(fh)
        except json.JSONDecodeError as exc:
            logger.error("%s | Inventory JSON is corrupted: %s", LOG_ERROR, exc)
            raise


def get_product_list(inventory: dict) -> list[dict]:
    """Return the products list from an inventory dict (safe, defaults to [])."""
    return inventory.get("products", [])


# ---------------------------------------------------------------------------
# Stock Status Determination
# ---------------------------------------------------------------------------


def determine_stock_status(product: dict, requested_qty: Optional[int]) -> str:
    """
    Determine the stock status label for a matched product.

    Parameters
    ----------
    product : dict
        A product record from inventory.json.
    requested_qty : int | None
        The quantity requested in the RFQ.

    Returns
    -------
    str
        One of the STOCK_STATUS_* constants.
    """
    stock: int = product.get("stock", 0)
    reorder_level: int = product.get("reorder_level", 0)

    if stock == 0:
        return STOCK_STATUS_OUT

    if stock <= reorder_level:
        return STOCK_STATUS_LOW

    return STOCK_STATUS_AVAILABLE


# ---------------------------------------------------------------------------
# Alternative Product Finder
# ---------------------------------------------------------------------------


def find_alternative(
    excluded_name: str,
    product_list: list[dict],
) -> Optional[dict]:
    """
    Return the first active, in-stock product that is not the excluded item.

    Used when the requested product is out of stock or unrecognised.

    Parameters
    ----------
    excluded_name : str
        The canonical name of the product to skip.
    product_list : list[dict]
        Full list of products from inventory.json.

    Returns
    -------
    dict | None
        A suitable alternative product record, or None if none found.
    """
    for product in product_list:
        if (
            product.get("name", "").lower() != excluded_name.lower()
            and product.get("is_active", True)
            and product.get("stock", 0) > 0
        ):
            return product
    return None


# ---------------------------------------------------------------------------
# Validate Items Against Inventory
# ---------------------------------------------------------------------------


def validate_items(
    items: list[dict],
    inventory: dict,
) -> list[InventoryValidationResult]:
    """
    Cross-reference a list of extracted RFQ items against the inventory.

    Each item in *items* should have at least:
      - ``product`` (str): product name from Gemini extraction
      - ``quantity`` (int | None): requested quantity
      - ``flags`` (list[str]): item-level flags from extraction

    Parameters
    ----------
    items : list[dict]
        Extracted line items from the RFQ.
    inventory : dict
        Full inventory dictionary loaded from inventory.json.

    Returns
    -------
    list[InventoryValidationResult]
        One validation result per input item.
    """
    product_list = get_product_list(inventory)
    results: list[InventoryValidationResult] = []

    logger.info(
        "%s | Validating %d item(s) against %d inventory product(s)",
        LOG_INVENTORY_VALIDATION,
        len(items),
        len(product_list),
    )

    for item in items:
        product_name: str = item.get("product", "").strip()
        requested_qty: Optional[int] = item.get("quantity")
        flags: list[str] = item.get("flags", [])

        # Attempt fuzzy match
        matched = fuzzy_match_product(product_name, product_list)

        if matched is None:
            # Unknown product — suggest an alternative
            alternative = find_alternative("", product_list)
            results.append(
                InventoryValidationResult(
                    requested_product=product_name,
                    matched_product=None,
                    sku=None,
                    unit_price=None,
                    requested_qty=requested_qty,
                    available_qty=None,
                    stock_status=STOCK_STATUS_UNKNOWN,
                    alternative_product=alternative["name"] if alternative else None,
                    alternative_sku=alternative["sku"] if alternative else None,
                    flags=flags,
                )
            )
            logger.info(
                "%s | '%s' → Unknown Product | alternative: %s",
                LOG_INVENTORY_VALIDATION,
                product_name,
                alternative["name"] if alternative else "None",
            )
            continue

        stock_status = determine_stock_status(matched, requested_qty)
        alternative: Optional[dict] = None

        if stock_status == STOCK_STATUS_OUT:
            alternative = find_alternative(matched["name"], product_list)

        results.append(
            InventoryValidationResult(
                requested_product=product_name,
                matched_product=matched["name"],
                sku=matched["sku"],
                unit_price=matched["unit_price"],
                requested_qty=requested_qty,
                available_qty=matched["stock"],
                stock_status=stock_status,
                alternative_product=alternative["name"] if alternative else None,
                alternative_sku=alternative["sku"] if alternative else None,
                flags=flags,
            )
        )
        logger.info(
            "%s | '%s' → '%s' | SKU: %s | Status: %s | Stock: %d",
            LOG_INVENTORY_VALIDATION,
            product_name,
            matched["name"],
            matched["sku"],
            stock_status,
            matched["stock"],
        )

    return results

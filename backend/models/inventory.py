"""
QuoteFlow AI — Pydantic Models: Inventory
==========================================
Data models for inventory products and per-item validation results.
These mirror the structure of ``database/inventory.json`` and provide
type safety across the service and route layers.

Author : QuoteFlow AI Team
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Inventory Product Models
# ---------------------------------------------------------------------------


class InventorySupplier(BaseModel):
    """Supplier contact block nested inside a product record."""

    name: str
    contact: str
    location: str


class InventoryAIMetadata(BaseModel):
    """AI-assist metadata embedded in each inventory product."""

    common_aliases: list[str] = Field(default_factory=list)
    procurement_category: str = ""
    confidence_keywords: list[str] = Field(default_factory=list)


class InventoryProduct(BaseModel):
    """
    Full product record as stored in ``inventory.json``.

    Only fields actually used by the backend integration are modelled
    here; unknown extra fields are silently ignored.
    """

    id: int
    name: str
    sku: str
    category: str
    description: str = ""
    unit_price: float
    stock: int
    status: str
    reorder_level: int
    is_active: bool = True
    min_order_qty: int = 1
    lead_time_days: int = 0
    warranty_months: int = 0
    brand: str = ""
    supplier: Optional[InventorySupplier] = None
    searchable_keywords: list[str] = Field(default_factory=list)
    ai_metadata: Optional[InventoryAIMetadata] = None
    tags: list[str] = Field(default_factory=list)

    class Config:
        extra = "ignore"   # tolerate unknown fields in the JSON


# ---------------------------------------------------------------------------
# Inventory Validation Result
# ---------------------------------------------------------------------------


class InventoryValidationResult(BaseModel):
    """
    Per-item result returned after cross-referencing an extracted product
    against the inventory database.
    """

    requested_product: str = Field(
        description="Product name as extracted from the RFQ by Gemini."
    )
    matched_product: Optional[str] = Field(
        default=None,
        description="Canonical product name from inventory, or None if unmatched.",
    )
    sku: Optional[str] = Field(
        default=None,
        description="Inventory SKU for the matched product.",
    )
    unit_price: Optional[float] = Field(
        default=None,
        description="Unit price (INR) from inventory.",
    )
    requested_qty: Optional[int] = Field(
        default=None,
        description="Quantity requested in the RFQ.",
    )
    available_qty: Optional[int] = Field(
        default=None,
        description="Current stock quantity in inventory.",
    )
    stock_status: str = Field(
        description=(
            "One of: 'Available', 'Low Stock', 'Out Of Stock', 'Unknown Product'."
        )
    )
    alternative_product: Optional[str] = Field(
        default=None,
        description="Suggested alternative product name when the requested item is unavailable.",
    )
    alternative_sku: Optional[str] = Field(
        default=None,
        description="SKU of the suggested alternative product.",
    )
    flags: list[str] = Field(
        default_factory=list,
        description="Item-level flags from the Gemini extractor (e.g. 'quantity_missing').",
    )

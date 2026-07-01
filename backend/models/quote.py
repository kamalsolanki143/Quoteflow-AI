"""
QuoteFlow AI — Pydantic Models: Quote
=======================================
Request and response models for the quote generation and manager
approval endpoints.

Author : QuoteFlow AI Team
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field, field_validator

from backend.utils.constants import MAX_QUOTE_QUANTITY


# ---------------------------------------------------------------------------
# Quote Generation — Request Body
# ---------------------------------------------------------------------------


class RFQItem(BaseModel):
    """A single line item inside a Quote Generation request."""

    product: str = Field(
        description="Product name as extracted from the RFQ."
    )
    quantity: Optional[int] = Field(
        default=None,
        description="Requested quantity (positive integer).  Null if unknown.",
    )

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: Optional[int]) -> Optional[int]:
        if v is not None:
            if v <= 0:
                raise ValueError("Quantity must be a positive integer.")
            if v > MAX_QUOTE_QUANTITY:
                raise ValueError(
                    f"Quantity {v} exceeds maximum allowed ({MAX_QUOTE_QUANTITY})."
                )
        return v


class QuoteGenerateRequest(BaseModel):
    """Request body for ``POST /api/v1/quote/generate``."""

    rfq_id: str = Field(
        description="RFQ tracking ID returned by the upload endpoint."
    )
    items: list[RFQItem] = Field(
        description="List of product line items to quote."
    )

    @field_validator("items")
    @classmethod
    def items_must_not_be_empty(cls, v: list) -> list:
        if not v:
            raise ValueError("At least one item is required.")
        return v


# ---------------------------------------------------------------------------
# Quote Generation — Response Body
# ---------------------------------------------------------------------------


class QuoteLineItem(BaseModel):
    """Priced line item within a generated quotation."""

    product: str
    sku: str
    requested_qty: Optional[int]
    available_qty: int
    fulfilled_qty: int
    unit_price: float
    line_total: float
    stock_status: str
    fulfillment_status: str   # "fulfilled" | "partial" | "unavailable"


class QuotePricing(BaseModel):
    """Financial summary for a generated quotation."""

    subtotal: float
    tax_rate: str            # e.g. "18%"
    tax_amount: float
    grand_total: float
    currency: str


class QuoteResponse(BaseModel):
    """Full response body for ``POST /api/v1/quote/generate``."""

    success: bool
    quote_id: str
    rfq_id: str
    line_items: list[QuoteLineItem]
    unavailable_items: list[str]
    pricing: QuotePricing
    status: str
    generated_at: str
    valid_until: str
    message: str


# ---------------------------------------------------------------------------
# Manager Approval — Request / Response
# ---------------------------------------------------------------------------


class ApprovalRequest(BaseModel):
    """Request body for the manager approval / rejection endpoints."""

    quote_id: str = Field(description="Quote ID to approve or reject.")
    manager_name: Optional[str] = Field(
        default=None, description="Name of the approving/rejecting manager."
    )
    notes: Optional[str] = Field(
        default=None, description="Optional manager notes or rejection reason."
    )


class ApprovalResponse(BaseModel):
    """Response body for approval / rejection actions."""

    success: bool
    quote_id: str
    action: str           # "approved" | "rejected"
    manager_name: Optional[str]
    notes: Optional[str]
    timestamp: str
    message: str

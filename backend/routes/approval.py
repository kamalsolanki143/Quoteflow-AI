"""
QuoteFlow AI — Manager Approval Route
=======================================
Implements:
  POST /api/v1/quote/approve   — Manager approves a generated quotation
  POST /api/v1/quote/reject    — Manager rejects a generated quotation

These endpoints complete the workflow so the Manager Approval Dashboard
on the frontend has real backend endpoints to call.

Author : QuoteFlow AI Team
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from backend.models.quote import ApprovalRequest, ApprovalResponse
from backend.utils.constants import QUOTE_STATUS_APPROVED, QUOTE_STATUS_REJECTED
from backend.utils.helpers import server_timestamp

logger = logging.getLogger("quoteflow")

router = APIRouter(prefix="/api/v1/quote")


# ---------------------------------------------------------------------------
# POST /api/v1/quote/approve
# ---------------------------------------------------------------------------


@router.post(
    "/approve",
    tags=["Manager Approval"],
    summary="Approve a generated quotation",
    response_description="Approval confirmation with quote ID and timestamp",
)
async def approve_quote(payload: dict):
    """
    Mark a quotation as **approved** by a manager.

    **Request body example:**

    ```json
    {
        "quote_id": "QT-A1B2C3D4",
        "manager_name": "Priya Sharma",
        "notes": "Approved for dispatch within 5 business days."
    }
    ```

    In the MVP the approval state is returned in the response; a production
    system would persist it to a database.
    """
    try:
        request = ApprovalRequest(**payload)
    except ValidationError as exc:
        errors = [f"{e['loc'][-1]}: {e['msg']}" for e in exc.errors()]
        raise HTTPException(
            status_code=422,
            detail=f"Invalid approval request: {'; '.join(errors)}",
        )

    if not request.quote_id or not request.quote_id.strip():
        raise HTTPException(
            status_code=400,
            detail="quote_id is required to approve a quotation.",
        )

    logger.info(
        "APPROVAL | quote_id=%s | action=approved | manager=%s",
        request.quote_id,
        request.manager_name or "N/A",
    )

    response = ApprovalResponse(
        success=True,
        quote_id=request.quote_id,
        action=QUOTE_STATUS_APPROVED,
        manager_name=request.manager_name,
        notes=request.notes,
        timestamp=server_timestamp(),
        message=(
            f"Quotation {request.quote_id} has been approved. "
            "The customer will be notified and the order can proceed."
        ),
    )
    return response.model_dump()


# ---------------------------------------------------------------------------
# POST /api/v1/quote/reject
# ---------------------------------------------------------------------------


@router.post(
    "/reject",
    tags=["Manager Approval"],
    summary="Reject a generated quotation",
    response_description="Rejection confirmation with reason and timestamp",
)
async def reject_quote(payload: dict):
    """
    Mark a quotation as **rejected** by a manager.

    **Request body example:**

    ```json
    {
        "quote_id": "QT-A1B2C3D4",
        "manager_name": "Priya Sharma",
        "notes": "Pricing is above budget. Please revise."
    }
    ```
    """
    try:
        request = ApprovalRequest(**payload)
    except ValidationError as exc:
        errors = [f"{e['loc'][-1]}: {e['msg']}" for e in exc.errors()]
        raise HTTPException(
            status_code=422,
            detail=f"Invalid rejection request: {'; '.join(errors)}",
        )

    if not request.quote_id or not request.quote_id.strip():
        raise HTTPException(
            status_code=400,
            detail="quote_id is required to reject a quotation.",
        )

    logger.info(
        "APPROVAL | quote_id=%s | action=rejected | manager=%s | reason=%s",
        request.quote_id,
        request.manager_name or "N/A",
        request.notes or "No reason provided",
    )

    response = ApprovalResponse(
        success=True,
        quote_id=request.quote_id,
        action=QUOTE_STATUS_REJECTED,
        manager_name=request.manager_name,
        notes=request.notes,
        timestamp=server_timestamp(),
        message=(
            f"Quotation {request.quote_id} has been rejected. "
            "Please review and regenerate with revised pricing or items."
        ),
    )
    return response.model_dump()

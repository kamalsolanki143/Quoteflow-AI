"""
QuoteFlow AI — Gemini Service
===============================
Thin wrapper around ``rfq_extractor.extract_rfq()`` that adds:
  - Python ``logging`` integration
  - Timeout error handling
  - Structured error responses

The underlying Gemini API call and prompt are owned by the existing
``rfq_extractor.py`` module and are NOT modified here.

Author : QuoteFlow AI Team
"""

from __future__ import annotations

import logging

from backend.rfq_extractor import extract_rfq
from backend.utils.constants import LOG_EXTRACTION_STARTED, LOG_EXTRACTION_COMPLETED, LOG_ERROR

logger = logging.getLogger("quoteflow")


def call_gemini_extractor(rfq_text: str) -> dict:
    """
    Call the Gemini-powered RFQ extractor and return the structured JSON.

    Parameters
    ----------
    rfq_text : str
        Raw text extracted from the uploaded RFQ document.

    Returns
    -------
    dict
        Structured extraction result from Gemini.  On success this contains
        ``customer_name``, ``items``, ``industry``, etc.
        On failure it contains an ``error`` key with a description.

    Raises
    ------
    RuntimeError
        If the extractor returns an error response (``"error"`` key present).
    ValueError
        If *rfq_text* is empty or too short to be meaningful.
    """
    if not rfq_text or len(rfq_text.strip()) < 5:
        raise ValueError(
            "RFQ text is too short or empty. "
            "Please upload a document with readable content."
        )

    logger.info(
        "%s | Sending %d characters to Gemini extractor",
        LOG_EXTRACTION_STARTED,
        len(rfq_text),
    )

    try:
        result = extract_rfq(rfq_text)
    except Exception as exc:
        logger.error("%s | Gemini API call failed: %s", LOG_ERROR, exc)
        raise RuntimeError(
            f"Gemini API error: {exc}. "
            "Please check your GOOGLE_API_KEY or GEMINI_API_KEY and try again."
        ) from exc

    # extract_rfq() returns {"error": "..."} on failure
    if isinstance(result, dict) and "error" in result:
        err_msg = result.get("error", "Unknown Gemini error")
        logger.error("%s | Gemini extractor returned error: %s", LOG_ERROR, err_msg)
        raise RuntimeError(f"Gemini extraction failed: {err_msg}")

    logger.info(
        "%s | Gemini extracted %d item(s) | confidence: %s | industry: %s",
        LOG_EXTRACTION_COMPLETED,
        len(result.get("items", [])),
        result.get("confidence", "unknown"),
        result.get("industry", "unknown"),
    )

    return result

"""
QuoteFlow AI — Utility Helpers
================================
Reusable helper functions shared across routes and services.

Functions
---------
server_timestamp()
    Return the current UTC time in ISO-8601 format.

extract_text_from_file(content, content_type, filename)
    Extract plain text from an uploaded file (TXT or PDF).

fuzzy_match_product(name, product_list)
    Match an extracted product name against the inventory using keyword
    and alias scoring — tolerates informal names, abbreviations, and
    Gemini-inferred product descriptions.

Author : QuoteFlow AI Team
"""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger("quoteflow")

# ---------------------------------------------------------------------------
# Timestamp
# ---------------------------------------------------------------------------


def server_timestamp() -> str:
    """Return the current UTC timestamp in ISO-8601 format."""
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# File Text Extraction
# ---------------------------------------------------------------------------


def extract_text_from_file(
    content: bytes,
    content_type: str,
    filename: str,
) -> str:
    """
    Extract plain text from an uploaded file.

    Parameters
    ----------
    content : bytes
        Raw bytes of the uploaded file.
    content_type : str
        MIME type reported by the client (e.g. ``"application/pdf"``).
    filename : str
        Original filename, used as a fallback MIME hint for .txt files
        uploaded with ``application/octet-stream``.

    Returns
    -------
    str
        Extracted plain text.  May be empty string if the PDF yields no
        selectable text (scanned / image-only PDFs).

    Raises
    ------
    ValueError
        If the file type is unsupported.
    RuntimeError
        If PDF extraction fails.
    """
    # Normalise: some browsers send .txt files as application/octet-stream
    resolved_type = content_type
    if content_type == "application/octet-stream" and filename.lower().endswith(".txt"):
        resolved_type = "text/plain"

    if resolved_type == "text/plain":
        try:
            return content.decode("utf-8", errors="ignore")
        except Exception as exc:
            raise RuntimeError(f"Failed to decode text file: {exc}") from exc

    if resolved_type == "application/pdf":
        return _extract_pdf_text(content)

    raise ValueError(
        f"Unsupported file type '{content_type}'. Upload a PDF or plain-text file."
    )


def _extract_pdf_text(content: bytes) -> str:
    """
    Extract text from a PDF using pypdf.

    Returns an empty string (rather than raising) for scanned / image-only
    PDFs so the caller can return a meaningful error to the user.
    """
    try:
        from pypdf import PdfReader  # type: ignore
        import io

        reader = PdfReader(io.BytesIO(content))
        pages: list[str] = []
        for page in reader.pages:
            text = page.extract_text() or ""
            pages.append(text)
        return "\n".join(pages).strip()
    except ImportError:
        raise RuntimeError(
            "pypdf is not installed. Run: pip install pypdf"
        )
    except Exception as exc:
        raise RuntimeError(f"Failed to parse PDF: {exc}") from exc


# ---------------------------------------------------------------------------
# Fuzzy Product Matching
# ---------------------------------------------------------------------------


def _tokenise(text: str) -> set[str]:
    """Lowercase, strip punctuation, split into word tokens."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return set(text.split())


def fuzzy_match_product(
    name: str,
    product_list: list[dict],
) -> Optional[dict]:
    """
    Find the best matching product in *product_list* for a given *name*.

    Scoring strategy (higher = better match):
    - +3  exact canonical name match (case-insensitive)
    - +2  per token matched in ``searchable_keywords``
    - +2  per token matched in ``ai_metadata.common_aliases``
    - +1  per token matched in canonical ``name``
    - +1  per token matched in ``brand``

    Parameters
    ----------
    name : str
        Product name as extracted by Gemini (may be informal / aliased).
    product_list : list[dict]
        List of product records from ``inventory.json``.

    Returns
    -------
    dict | None
        Best-matching product record, or ``None`` if no meaningful match
        is found (score == 0).
    """
    if not name or not product_list:
        return None

    query_tokens = _tokenise(name)
    best_product: Optional[dict] = None
    best_score: int = 0

    for product in product_list:
        score = 0

        # Exact canonical name match
        if product.get("name", "").lower() == name.lower():
            score += 3

        # Token match against canonical name
        name_tokens = _tokenise(product.get("name", ""))
        score += len(query_tokens & name_tokens)

        # Token match against brand
        brand_tokens = _tokenise(product.get("brand", ""))
        score += len(query_tokens & brand_tokens)

        # Token match against searchable_keywords
        for kw in product.get("searchable_keywords", []):
            kw_tokens = _tokenise(kw)
            if query_tokens & kw_tokens:
                score += 2
                break  # count once per keyword list

        # Token match against common_aliases
        for alias in product.get("ai_metadata", {}).get("common_aliases", []):
            alias_tokens = _tokenise(alias)
            if query_tokens & alias_tokens:
                score += 2
                break  # count once per alias list

        # Token match against confidence_keywords
        conf_kws = product.get("ai_metadata", {}).get("confidence_keywords", [])
        for ck in conf_kws:
            if ck.lower() in name.lower():
                score += 1

        if score > best_score:
            best_score = score
            best_product = product

    # Require a minimum meaningful score to avoid false positives
    return best_product if best_score >= 2 else None

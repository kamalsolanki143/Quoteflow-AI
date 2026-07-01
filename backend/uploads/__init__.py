"""
QuoteFlow AI — Uploads Module
=============================
This package directory is reserved for storing temporary RFQ document uploads 
(PDFs, TXT files) before processing, if the server handles large files that 
cannot fit entirely in memory.

Currently, the upload router extracts text directly from the `UploadFile` byte stream.

Author : QuoteFlow AI Team
"""

import os
import logging

logger = logging.getLogger("quoteflow.uploads")

def ensure_uploads_dir(base_path: str) -> str:
    """
    Ensure the uploads directory exists for storing temporary files.
    
    Args:
        base_path (str): The root directory where uploads should be created.
        
    Returns:
        str: The absolute path to the uploads directory.
    """
    uploads_dir = os.path.join(base_path, "uploads")
    try:
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir, exist_ok=True)
            logger.info("Created uploads directory at %s", uploads_dir)
    except Exception as e:
        logger.error("Failed to create uploads directory: %s", e)
        raise RuntimeError(f"Could not create uploads directory: {e}") from e
    
    return uploads_dir

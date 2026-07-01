# QuoteFlow AI — API Documentation

## Project Overview
QuoteFlow AI is an AI-powered B2B RFQ (Request For Quotation) to Quote Automation Platform. The backend is built using FastAPI and integrates with Google's Gemini AI to extract structured product requirements from unstructured RFQ documents (PDF/TXT). It cross-references extracted items against a local inventory database, calculates pricing and taxes, and generates a manager-ready quotation.

## Base URL
**Local Development:** `http://localhost:8000`
**Production:** *(Configure via `.env` or Vercel/Render variables)*

## Authentication
**MVP Status:** None. 
For the purpose of the hackathon MVP, all endpoints are public. In a production environment, routes will be secured using JWT (JSON Web Tokens).

---

## 1. Health API

Check the operational status of the backend, including the database and AI engine connectivity.

**Endpoint:** `GET /health`

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "QuoteFlow AI",
  "version": "1.0.0-mvp",
  "timestamp": "2026-07-01T12:00:00Z",
  "components": {
    "api": "operational",
    "inventory_db": "connected",
    "ai_engine": "ready"
  }
}
```

---

## 2. RFQ Upload API

Upload an RFQ document to trigger the Gemini AI extraction and inventory validation pipeline.

**Endpoint:** `POST /api/v1/rfq/upload`
**Content-Type:** `multipart/form-data`

**Request:**
- `file`: The RFQ document (`.pdf` or `.txt`)

**Success Response (200 OK):**
```json
{
  "success": true,
  "rfq_id": "RFQ-A1B2C3D4",
  "filename": "order_request.pdf",
  "content_type": "application/pdf",
  "size_bytes": 102400,
  "timestamp": "2026-07-01T12:05:00Z",
  "extraction": {
    "customer_name": "Suresh Medical",
    "customer_contact": "9876543210",
    "industry": "Pharma"
  },
  "items": [
    {
      "product": "Paracetamol 500mg Tablets",
      "quantity": 500,
      "unit": "strips"
    }
  ],
  "inventory_validation": [
    {
      "product": "Paracetamol 500mg Tablets",
      "matched": true,
      "stock_available": 1000
    }
  ],
  "message": "RFQ processed successfully."
}
```

---

## 3. Inventory API

Retrieve the full product catalog, stock levels, and unit pricing.

**Endpoint:** `GET /api/v1/inventory`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "sku": "PH-PARA-500",
        "name": "Paracetamol 500mg Tablets",
        "stock": 1000,
        "unit_price": 12.50
      }
    ]
  },
  "product_count": 1,
  "timestamp": "2026-07-01T12:10:00Z"
}
```

---

## 4. Quote Generation API

Generate a priced quotation based on the extracted RFQ payload.

**Endpoint:** `POST /api/v1/quote/generate`
**Content-Type:** `application/json`

**Request Example:**
```json
{
  "rfq_id": "RFQ-A1B2C3D4",
  "items": [
    {
      "product": "Paracetamol 500mg Tablets",
      "quantity": 500
    }
  ]
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "quote_id": "QT-9F8E7D6C",
  "rfq_id": "RFQ-A1B2C3D4",
  "line_items": [
    {
      "product": "Paracetamol 500mg Tablets",
      "sku": "PH-PARA-500",
      "requested_qty": 500,
      "available_qty": 1000,
      "fulfilled_qty": 500,
      "unit_price": 12.50,
      "line_total": 6250.00,
      "stock_status": "Available",
      "fulfillment_status": "fulfilled"
    }
  ],
  "unavailable_items": [],
  "pricing": {
    "subtotal": 6250.00,
    "tax_rate": "18%",
    "tax_amount": 1125.00,
    "grand_total": 7375.00,
    "currency": "INR"
  },
  "status": "pending_approval",
  "generated_at": "2026-07-01T12:15:00Z",
  "valid_until": "14 days from generation"
}
```

---

## 5. Manager Approval API

Endpoints for a manager to review and approve/reject a generated quotation.

### Approve Quote
**Endpoint:** `POST /api/v1/quote/approve`
**Content-Type:** `application/json`

**Request Example:**
```json
{
  "quote_id": "QT-9F8E7D6C"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "quote_id": "QT-9F8E7D6C",
  "action": "approved",
  "timestamp": "2026-07-01T12:20:00Z",
  "message": "Quotation QT-9F8E7D6C has been approved."
}
```

### Reject Quote
**Endpoint:** `POST /api/v1/quote/reject`
**Content-Type:** `application/json`

**Request Example:**
```json
{
  "quote_id": "QT-9F8E7D6C",
  "reason": "Out of Stock"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "quote_id": "QT-9F8E7D6C",
  "action": "rejected",
  "notes": "Out of Stock",
  "timestamp": "2026-07-01T12:22:00Z",
  "message": "Quotation QT-9F8E7D6C has been rejected."
}
```

---

## Error Responses

The API uses standard HTTP status codes and returns a consistent error format.

**Error Response Example (422 Unprocessable Entity):**
```json
{
  "detail": "Invalid request: quantity: Field required"
}
```

### HTTP Status Codes
- `200 OK` - Request succeeded.
- `400 Bad Request` - Missing file, unsupported format, or malformed JSON.
- `413 Payload Too Large` - Uploaded file exceeds the 10MB limit.
- `422 Unprocessable Entity` - Validation error (e.g., missing required fields like `quote_id`).
- `500 Internal Server Error` - Backend failure or unhandled exception.
- `503 Service Unavailable` - External AI engine (Gemini) or Database (JSON file) unreachable.

---

## Folder Structure

```
backend/
├── database/            # Static JSON databases (inventory.json)
├── models/              # Pydantic validation schemas
├── routes/              # FastAPI route controllers
├── services/            # Core business logic (AI, Pricing, Inventory)
├── uploads/             # Temporary storage for PDF/TXT files
├── utils/               # Constants and helper functions
├── main.py              # Application entrypoint & global configuration
└── rfq_extractor.py     # Gemini AI prompt and extraction engine
```

---

## Notes for Frontend Developers
1. **CORS:** CORS is fully enabled (`*`). You can make requests from `localhost:5173` without encountering preflight errors.
2. **Timeouts:** The Gemini AI extraction (`/api/v1/rfq/upload`) can take between 5 to 15 seconds. Ensure your Axios client timeout is set to at least `30000ms`.
3. **Form Data:** The `/rfq/upload` endpoint expects `multipart/form-data`. Do not stringify the file object; use the native browser `FormData` API.
4. **Retry Logic:** If `/rfq/upload` fails with a `503` (Gemini API overload), implement a short exponential backoff before alerting the user.

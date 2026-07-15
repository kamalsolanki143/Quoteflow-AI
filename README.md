# QuoteFlow AI 🤖

> **AI-powered RFQ → Quote Automation Agent**
> Automatically converts Request For Quotation documents (PDFs, emails, text files) into professional, accurate quotations using Google Gemini AI.
>
> Built for the **FlowZint AI Hackathon 2026** 🚀

---

## 📸 Screenshots

| Landing Page | Upload RFQ | Inventory Validation | Manager Approval |
|:---:|:---:|:---:|:---:|
| ![Landing](landing%20page.png) | ![Upload](upload%20pdf.png) | ![Inventory](inventory%20validation%20dashboard.png) | ![Approval](Manager%20Approval%20Dashboard.png) |

---

## 🔄 How It Works

```
User Uploads RFQ (PDF / TXT)
        ↓
  File Validation & Text Extraction
        ↓
  Gemini AI — RFQ Extraction
  (reads product names, quantities, customer info)
        ↓
  Structured JSON
        ↓
  Inventory Validation
  (fuzzy matches products, checks stock levels)
        ↓
  Quote Generation
  (line totals + 18% GST + grand total)
        ↓
  Manager Approval Dashboard
        ↓
  JSON Response to Frontend
```

---

## 🏗️ Project Structure

```
Quoteflow-AI/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── rfq_extractor.py           # Gemini AI extraction module
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Environment variable template
│   ├── database/
│   │   └── inventory.json         # Product inventory (5 products)
│   ├── models/
│   │   ├── inventory.py           # Pydantic: InventoryProduct, ValidationResult
│   │   └── quote.py               # Pydantic: QuoteRequest, QuoteResponse, Approval
│   ├── routes/
│   │   ├── upload.py              # POST /api/v1/rfq/upload
│   │   ├── quote.py               # POST /api/v1/quote/generate
│   │   └── approval.py            # POST /api/v1/quote/approve | /reject
│   ├── services/
│   │   ├── gemini_service.py      # Wrapper around rfq_extractor.extract_rfq()
│   │   ├── rfq_parser.py          # Normalises Gemini output → item list
│   │   ├── inventory_service.py   # Stock validation + alternatives
│   │   └── quote_generator.py     # Pricing, GST, grand total
│   └── utils/
│       ├── constants.py           # GST rate, file limits, log tags
│       └── helpers.py             # Timestamps, PDF/TXT extraction, fuzzy match
├── frontend/
│   └── src/
│       ├── pages/                 # Home, Upload, Dashboard
│       ├── components/            # Navbar, RFQUpload, QuoteTable, ApprovalCard
│       └── services/api.js        # Axios API client
├── database/
│   └── inventory.json             # Root inventory (source of truth)
├── docs/
│   └── workflow.md
└── sample_rfqs/
    └── sample_rfq_1.txt           # Sample RFQ for testing
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + Vite |
| **Backend** | FastAPI (Python) |
| **AI Engine** | Google Gemini 2.5 Flash Lite |
| **PDF Parsing** | pypdf |
| **Validation** | Pydantic v2 |
| **Server** | Uvicorn (ASGI) |
| **Inventory** | JSON flat-file database |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free [Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/kamalsolanki143/Quoteflow-AI.git
cd Quoteflow-AI
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your GEMINI_API_KEY
```

### 3. Run the Backend

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

The API will be available at:
- **Swagger UI:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check |
| `GET` | `/api/v1/inventory` | List all inventory products |
| `POST` | `/api/v1/rfq/upload` | Upload PDF/TXT RFQ → AI extraction + inventory validation |
| `POST` | `/api/v1/quote/generate` | Generate priced quotation from extracted items |
| `POST` | `/api/v1/quote/approve` | Manager approves a quotation |
| `POST` | `/api/v1/quote/reject` | Manager rejects a quotation |

### Example: Upload RFQ

```bash
curl -X POST http://localhost:8000/api/v1/rfq/upload \
  -F "file=@sample_rfqs/sample_rfq_1.txt"
```

**Response:**
```json
{
  "success": true,
  "rfq_id": "RFQ-A1B2C3D4",
  "items": [
    { "product": "HP Laptop", "quantity": 50, "unit": "nos" },
    { "product": "Dell Monitor", "quantity": 20, "unit": "nos" }
  ],
  "inventory_validation": [
    {
      "requested_product": "HP Laptop",
      "matched_product": "HP Laptop",
      "sku": "HP-LPT-15-2026",
      "unit_price": 52999.0,
      "available_qty": 120,
      "stock_status": "Available"
    }
  ],
  "extraction": {
    "customer_name": "NexaTech Solutions Pvt. Ltd.",
    "industry": "Electronics",
    "confidence": "high"
  }
}
```

### Example: Generate Quote

```bash
curl -X POST http://localhost:8000/api/v1/quote/generate \
  -H "Content-Type: application/json" \
  -d '{
    "rfq_id": "RFQ-A1B2C3D4",
    "items": [
      { "product": "HP Laptop", "quantity": 50 },
      { "product": "Dell Monitor", "quantity": 20 }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "quote_id": "QT-XY123456",
  "line_items": [
    {
      "product": "HP Laptop",
      "sku": "HP-LPT-15-2026",
      "fulfilled_qty": 50,
      "unit_price": 52999.0,
      "line_total": 2649950.0,
      "stock_status": "Available"
    }
  ],
  "pricing": {
    "subtotal": 3419930.0,
    "tax_rate": "18%",
    "tax_amount": 615587.4,
    "grand_total": 4035517.4,
    "currency": "INR"
  },
  "status": "pending_approval"
}
```

---

## 📦 Inventory

5 products across 4 categories (Electronics / IT Hardware):

| Product | SKU | Price (INR) | Stock |
|---|---|---|---|
| HP Laptop | HP-LPT-15-2026 | ₹52,999 | 120 |
| Dell Monitor | DELL-MON-27-4K | ₹38,499 | 75 |
| Canon Printer | CANON-PRN-MF645 | ₹34,999 | 40 |
| Lenovo ThinkPad | LEN-TP-T14-G4 | ₹78,999 | 55 |
| Logitech Keyboard | LOG-KB-MX-KEYS | ₹9,995 | 200 |

> GST Rate: **18%** (standard Indian B2B)

---

## 🧠 AI Features

- **Gemini 2.5 Flash Lite** — zero-latency extraction with structured JSON output
- **Industry detection** — auto-detects Pharma / Construction / Textiles / Electronics
- **Bilingual understanding** — handles Hindi-English mixed RFQs ("bhai", "urgent", "kal tak")
- **Fuzzy product matching** — maps informal names like "Wireless Office Keyboard" → "Logitech Keyboard"
- **Smart alternatives** — suggests in-stock alternatives for unavailable products

---

## 🛡️ Error Handling

| Scenario | HTTP Code |
|---|---|
| Empty file uploaded | `400` |
| Unsupported file type | `400` |
| File exceeds 10 MB | `413` |
| Scanned / image-only PDF | `422` |
| Gemini API failure / timeout | `503` |
| No items extracted from RFQ | `422` |
| Invalid/missing request fields | `422` |
| Inventory file missing | `503` |

---

## 👥 Team Contributions

| Module | Contributor |
|---|---|
| React Frontend + UI Design | Team |
| Landing Page & RFQ Upload UI | Team |
| Inventory Validation UI | Team |
| Manager Approval Dashboard | Team |
| Gemini RFQ Extraction (`rfq_extractor.py`) | Team |
| **Backend Integration** (routes, services, models, utils) | [@captainramen35-lgtm](https://github.com/captainramen35-lgtm) |

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built with ❤️ for FlowZint AI Hackathon 2026</strong>
</div>

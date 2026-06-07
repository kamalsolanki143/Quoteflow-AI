# QuoteFlow AI — Workflow Documentation

> **Version**: 1.0.0-MVP  
> **Hackathon**: FlowZint AI Hackathon 2026  
> **Last Updated**: 07 June 2026

---

## Table of Contents

1. [Workflow Overview](#workflow-overview)
2. [End-to-End Flow Diagram](#end-to-end-flow-diagram)
3. [Step-by-Step Breakdown](#step-by-step-breakdown)
   - [Step 1 — RFQ Upload](#step-1--rfq-upload)
   - [Step 2 — Product Extraction](#step-2--product-extraction)
   - [Step 3 — Inventory Validation](#step-3--inventory-validation)
   - [Step 4 — Pricing Calculation](#step-4--pricing-calculation)
   - [Step 5 — Quote Generation](#step-5--quote-generation)
   - [Step 6 — Approval Workflow](#step-6--approval-workflow)
4. [State Machine](#state-machine)
5. [Error Handling](#error-handling)
6. [Future Enhancements](#future-enhancements)
7. [Human Decision Branch — Realistic Approval Workflow](#human-decision-branch--realistic-approval-workflow)
8. [Business Metrics & Monitoring](#business-metrics--monitoring)
9. [60-Second Judge Demo Flow](#60-second-judge-demo-flow)
10. [Assumptions for MVP](#assumptions-for-mvp)

---

## Workflow Overview

QuoteFlow AI converts a raw RFQ document into an approved quotation through **six automated steps**. Each step is designed to be modular, independently testable, and easily extendable.

```
  ┌─────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
  │  UPLOAD  │───►│  EXTRACT  │───►│ VALIDATE  │───►│  PRICE   │───►│ GENERATE │───►│ APPROVE  │
  │   RFQ    │    │ PRODUCTS  │    │ INVENTORY │    │ CALCULATE│    │  QUOTE   │    │  QUOTE   │
  └─────────┘    └───────────┘    └───────────┘    └──────────┘    └──────────┘    └──────────┘
       📄             🤖               📦              💰              📋              ✅
```

---

## End-to-End Flow Diagram

```
                                 ┌─────────────────┐
                                 │    CUSTOMER      │
                                 │  Uploads RFQ     │
                                 │  (PDF / TXT)     │
                                 └────────┬─────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │   STEP 1: UPLOAD       │
                              │                        │
                              │  • File validation     │
                              │  • Size check          │
                              │  • Format detection    │
                              │  • Generate RFQ ID     │
                              └───────────┬────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │  STEP 2: EXTRACTION    │
                              │                        │
                              │  • Parse document text │
                              │  • AI identifies items │
                              │  • Extract quantities  │
                              │  • Structure as JSON   │
                              └───────────┬────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │  STEP 3: VALIDATION    │
                              │                        │
                              │  • Load inventory DB   │
                              │  • Match product names │
                              │  • Check stock levels  │
                              │  • Flag unavailable    │
                              └───────────┬────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │  STEP 4: PRICING       │
                              │                        │
                              │  • Look up unit prices │
                              │  • Calculate line tots │
                              │  • Compute subtotal    │
                              │  • Apply GST (18%)     │
                              │  • Calculate grand tot │
                              └───────────┬────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │  STEP 5: GENERATION    │
                              │                        │
                              │  • Build quote object  │
                              │  • Assign Quote ID     │
                              │  • Set validity period │
                              │  • Status: PENDING     │
                              └───────────┬────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │  STEP 6: APPROVAL      │
                              │                        │
                              │  • Manager reviews     │
                              │  • One-click approve   │
                              │  • Status: APPROVED    │
                              │  • Ready to send       │
                              └───────────┬────────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │    CUSTOMER      │
                                 │  Receives Final  │
                                 │  Quotation       │
                                 └─────────────────┘
```

---

## Step-by-Step Breakdown

### Step 1 — RFQ Upload

**Endpoint**: `POST /api/v1/rfq/upload`

| Aspect           | Detail                                              |
| ---------------- | --------------------------------------------------- |
| **Input**        | RFQ file (PDF or TXT)                               |
| **Validations**  | File type, file size (max 10 MB)                    |
| **Processing**   | Read file bytes, decode text, generate tracking ID  |
| **Output**       | `rfq_id`, filename, text preview, size              |

**Flow:**

```
User selects file ──► Drag-and-drop / file picker
                          │
                          ▼
               Frontend sends multipart POST
                          │
                          ▼
               Backend validates file type
                          │
              ┌───────────┴───────────┐
              │                       │
         Valid type              Invalid type
              │                       │
              ▼                       ▼
     Read & decode text        Return 400 error
              │
              ▼
     Generate RFQ-XXXXXXXX ID
              │
              ▼
     Return upload result JSON
```

---

### Step 2 — Product Extraction

**Current (MVP)**: Simplified text parsing  
**Planned**: Google Gemini API integration

| Aspect           | Detail                                              |
| ---------------- | --------------------------------------------------- |
| **Input**        | Raw text from uploaded RFQ                          |
| **AI Model**     | Gemini 2.0 Flash (planned)                          |
| **Output**       | Structured JSON array of `{product, quantity}`      |

**Extraction example:**

```
 INPUT (Raw RFQ Text)                OUTPUT (Structured JSON)
 ─────────────────────               ────────────────────────
 "50 HP Laptops"            ──►      { "product": "HP Laptop",
                                       "quantity": 50 }

 "20 Dell Monitors"         ──►      { "product": "Dell Monitor",
                                       "quantity": 20 }

 "10 Canon Printers"        ──►      { "product": "Canon Printer",
                                       "quantity": 10 }
```

**AI Prompt strategy (planned):**

```
 System: You are a procurement assistant. Extract all requested
         products and quantities from the following RFQ document.
         Return a JSON array of objects with "product" and "quantity"
         fields. Be precise with quantities and product names.

 User:   <RFQ text content>
```

---

### Step 3 — Inventory Validation

| Aspect           | Detail                                               |
| ---------------- | ---------------------------------------------------- |
| **Input**        | Extracted product list from Step 2                   |
| **Data Source**   | `database/inventory.json`                            |
| **Matching**     | Case-insensitive product name lookup                 |
| **Output**       | Validated items with availability status             |

**Validation logic:**

```
For each requested item:
    │
    ├── Product found in inventory?
    │       │
    │       ├── YES ──► Check stock level
    │       │               │
    │       │               ├── Stock ≥ Requested Qty  ──► Status: FULFILLED
    │       │               │
    │       │               └── Stock < Requested Qty  ──► Status: PARTIAL
    │       │                   (fulfilled_qty = available_stock)
    │       │
    │       └── NO  ──► Add to unavailable_items list
    │
    └── Continue to next item
```

---

### Step 4 — Pricing Calculation

| Aspect           | Detail                                               |
| ---------------- | ---------------------------------------------------- |
| **Input**        | Validated items with fulfilled quantities            |
| **Pricing**      | Unit price from inventory × fulfilled quantity       |
| **Tax**          | 18% GST (Goods and Services Tax — India)             |
| **Currency**     | INR (Indian Rupee)                                   |

**Calculation formula:**

```
 Line Total  = fulfilled_qty × unit_price
 Subtotal    = Σ (all line totals)
 Tax Amount  = subtotal × 0.18
 Grand Total = subtotal + tax_amount
```

**Example calculation:**

```
 ┌──────────────────┬─────┬──────────────┬───────────────┐
 │ Product          │ Qty │ Unit Price   │ Line Total    │
 ├──────────────────┼─────┼──────────────┼───────────────┤
 │ HP Laptop        │  50 │   ₹52,999   │  ₹26,49,950   │
 │ Dell Monitor     │  20 │   ₹38,499   │   ₹7,69,980   │
 │ Canon Printer    │  10 │   ₹34,999   │   ₹3,49,990   │
 │ Lenovo ThinkPad  │  15 │   ₹78,999   │  ₹11,84,985   │
 │ Logitech Keyboard│  80 │    ₹9,995   │   ₹7,99,600   │
 ├──────────────────┴─────┴──────────────┼───────────────┤
 │                            Subtotal   │  ₹57,54,505   │
 │                            GST (18%)  │  ₹10,35,811   │
 │                            GRAND TOTAL│  ₹67,90,316   │
 └───────────────────────────────────────┴───────────────┘
```

---

### Step 5 — Quote Generation

| Aspect           | Detail                                               |
| ---------------- | ---------------------------------------------------- |
| **Input**        | Priced line items from Step 4                        |
| **Quote ID**     | `QT-XXXXXXXX` (auto-generated UUID)                 |
| **Validity**     | 7 days from generation                               |
| **Status**       | `pending_approval`                                   |

**Generated quote structure:**

```json
{
  "quote_id": "QT-E5F6G7H8",
  "rfq_id": "RFQ-A1B2C3D4",
  "line_items": [ ... ],
  "unavailable_items": [],
  "pricing": {
    "subtotal": 5754505.00,
    "tax_rate": "18%",
    "tax_amount": 1035811.00,
    "grand_total": 6790316.00,
    "currency": "INR"
  },
  "status": "pending_approval",
  "valid_until": "7 days from generation"
}
```

---

### Step 6 — Approval Workflow

| Aspect           | Detail                                               |
| ---------------- | ---------------------------------------------------- |
| **Actor**        | Sales Manager                                        |
| **Action**       | One-click "Approve" button in the UI                 |
| **Status Change**| `pending_approval` → `approved`                      |
| **UI Feedback**  | Confirmation banner with success animation           |

**Approval flow:**

```
 Manager views quotation
         │
         ▼
 Reviews line items, pricing, availability
         │
         ▼
 ┌───────────────────────┐
 │   Click "✅ Approve"  │
 └───────────┬───────────┘
             │
             ▼
 Status changes to APPROVED
             │
             ▼
 Confirmation UI displayed
             │
             ▼
 Quote ready to send to customer
```

---

## State Machine

The quotation progresses through the following states:

```
 ┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────┐
 │ UPLOADED  │────►│  PROCESSING   │────►│   PENDING    │────►│ APPROVED │
 │          │     │               │     │   APPROVAL   │     │          │
 └──────────┘     └───────────────┘     └──────────────┘     └──────────┘
                          │                                        │
                          ▼                                        ▼
                   ┌──────────────┐                         ┌──────────┐
                   │    ERROR     │                         │   SENT   │
                   │              │                         │ (future) │
                   └──────────────┘                         └──────────┘
```

| State              | Description                                    |
| ------------------ | ---------------------------------------------- |
| `UPLOADED`         | RFQ file received, awaiting processing         |
| `PROCESSING`       | AI extraction and inventory validation in progress |
| `PENDING_APPROVAL` | Quote generated, awaiting manager sign-off     |
| `APPROVED`         | Manager approved — ready for delivery          |
| `SENT`             | Quote emailed to customer (future feature)     |
| `ERROR`            | Processing failed — requires manual review     |

---

## Error Handling

| Error Scenario                | HTTP Code | Handling                                  |
| ----------------------------- | --------- | ----------------------------------------- |
| Unsupported file type         | 400       | Reject with supported formats list        |
| No items in RFQ data          | 400       | Prompt user to provide product items      |
| Inventory database missing    | 503       | Service degraded — notify ops             |
| Inventory JSON corrupted      | 500       | Internal error — log and alert            |
| Product not found in inventory| —         | Added to `unavailable_items` in response  |
| Insufficient stock            | —         | Partial fulfilment with `partial` status  |
| API timeout                   | 504       | Axios retry with 30s timeout              |

---

## Future Enhancements

| Enhancement                 | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| WhatsApp RFQ Intake         | Receive RFQs via WhatsApp using Twilio API            |
| Full Gemini Integration     | AI-powered extraction with specification matching     |
| Multi-language RFQs         | Support Hindi, Spanish, German, and more              |
| AI Pricing Suggestions      | Dynamic pricing based on volume and market data       |
| CRM Integration             | Sync quotations with Salesforce / HubSpot             |
| Email Delivery              | Auto-send approved quotes via SendGrid                |
| Customer Analytics          | Dashboard with conversion rates, response times       |
| Multi-Agent Workflows       | Specialised AI agents for extraction, pricing, review |
| PostgreSQL Migration        | Replace JSON with a relational database               |
| Role-Based Access Control   | Authentication with Firebase Auth                     |

---

## Human Decision Branch — Realistic Approval Workflow

The MVP demonstrates a simple "Approve" action, but real B2B workflows demand a **three-way decision model**. This section documents the enterprise-grade approval architecture that QuoteFlow AI is designed to support.

### Why a Single "Approve" Button Isn't Enough

In practice, a sales manager reviewing a quotation encounters three distinct scenarios:

| Scenario                | Frequency | Real-World Trigger                                         |
| ----------------------- | --------- | ---------------------------------------------------------- |
| **Approve as-is**       | ~60%      | Quote looks correct — pricing, stock, and terms are fine   |
| **Reject outright**     | ~10%      | Customer is blacklisted, RFQ is a duplicate, or out of scope |
| **Request changes**     | ~30%      | Minor adjustments needed — pricing override, swap product, change qty |

Without all three paths, 30% of quotes get stuck in a manual back-and-forth loop.

### Three-Way Decision Flow

```
                        ┌──────────────────────────────────┐
                        │        GENERATED QUOTATION        │
                        │                                  │
                        │  Quote ID:  QT-E5F6G7H8          │
                        │  Status:    PENDING_APPROVAL     │
                        │  Items:     5 line items         │
                        │  Total:     ₹67,90,316           │
                        └──────────────┬───────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────────┐
                        │       👤 MANAGER REVIEW           │
                        │                                  │
                        │  • Verify line items & pricing   │
                        │  • Check stock fulfilment        │
                        │  • Review customer history       │
                        │  • Validate special terms        │
                        └──────────────┬───────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
         ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
         │  ✅ APPROVE      │ │  ❌ REJECT       │ │  🔄 REQUEST     │
         │                 │ │                 │ │   CHANGES       │
         │ • Status →      │ │ • Status →      │ │                 │
         │   APPROVED      │ │   REJECTED      │ │ • Status →      │
         │ • Ready for     │ │ • Reason logged │ │   REVISION      │
         │   delivery      │ │ • RFQ archived  │ │ • Change notes  │
         │ • Timestamp     │ │ • Customer      │ │   attached      │
         │   recorded      │ │   notified      │ │ • Returns to    │
         │                 │ │                 │ │   quoting engine│
         └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
                  │                   │                    │
                  ▼                   ▼                    ▼
         ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
         │  📧 DELIVER      │ │  📁 CLOSE        │ │  🔁 RE-PROCESS  │
         │                 │ │                 │ │                 │
         │ Email / WhatsApp│ │ Archive & log   │ │ Modify items,   │
         │ PDF generation  │ │ rejection reason│ │ re-price, and   │
         │ CRM update      │ │ Analytics data  │ │ re-submit for   │
         │                 │ │                 │ │ approval        │
         └─────────────────┘ └─────────────────┘ └────────┬────────┘
                                                          │
                                                          │ Loop back
                                                          ▼
                                                 ┌─────────────────┐
                                                 │ MANAGER REVIEW   │
                                                 │ (second pass)    │
                                                 └─────────────────┘
```

### Decision Outcomes — Detailed

#### ✅ Approve

| Aspect              | Detail                                                    |
| ------------------- | --------------------------------------------------------- |
| **Status Change**   | `PENDING_APPROVAL` → `APPROVED`                           |
| **Who**             | Sales Manager, VP Sales, or auto-approve (< threshold)    |
| **Next Action**     | Quote queued for customer delivery                        |
| **Audit Trail**     | Approver name, timestamp, IP address logged               |
| **SLA**             | Ideally within 30 minutes of generation                   |

#### ❌ Reject

| Aspect              | Detail                                                    |
| ------------------- | --------------------------------------------------------- |
| **Status Change**   | `PENDING_APPROVAL` → `REJECTED`                           |
| **Mandatory Field** | Rejection reason (dropdown + free text)                   |
| **Next Action**     | RFQ archived, analytics updated                           |
| **Common Reasons**  | Duplicate RFQ, blacklisted customer, out-of-scope request |
| **Re-open?**        | Can be re-opened within 48 hours if reason resolved       |

#### 🔄 Request Changes

| Aspect              | Detail                                                    |
| ------------------- | --------------------------------------------------------- |
| **Status Change**   | `PENDING_APPROVAL` → `REVISION_REQUESTED`                 |
| **Mandatory Field** | Change notes specifying what to modify                    |
| **Next Action**     | Quote returns to the pricing/generation engine            |
| **Common Changes**  | Price override, quantity adjustment, product substitution |
| **Loop Limit**      | Max 3 revision cycles before escalation                   |

### Updated State Machine (with Decision Branch)

```
 ┌──────────┐     ┌───────────┐     ┌──────────────┐
 │ UPLOADED  │────►│PROCESSING │────►│   PENDING    │
 └──────────┘     └─────┬─────┘     │   APPROVAL   │
                        │           └──────┬───────┘
                        │                  │
                        ▼           ┌──────┼──────────────┐
                 ┌──────────┐      │      │              │
                 │  ERROR   │      ▼      ▼              ▼
                 └──────────┘ ┌────────┐ ┌────────┐ ┌──────────┐
                              │APPROVED│ │REJECTED│ │ REVISION │
                              └───┬────┘ └────────┘ │REQUESTED │
                                  │                 └─────┬────┘
                                  ▼                       │
                              ┌────────┐                  │
                              │  SENT  │       Loop back to
                              │(future)│       PENDING_APPROVAL
                              └────────┘
```

---

## Business Metrics & Monitoring

Tracking the right KPIs transforms QuoteFlow AI from a hackathon demo into a **measurable business tool**. This section defines the metrics that matter to operations, sales leadership, and executive stakeholders.

### Why KPI Tracking Matters

> Without measurement, automation is just speed. **With measurement, it's competitive advantage.**

B2B companies that track quoting metrics outperform competitors because they can:

- Identify bottlenecks in the approval pipeline
- Measure the impact of AI on revenue velocity
- Forecast sales pipeline more accurately
- Demonstrate ROI to leadership and investors

### Core KPI Dashboard

| #  | Metric                     | Definition                                                | Target (Post-Automation) | Why It Matters                                        |
| -- | -------------------------- | --------------------------------------------------------- | ------------------------ | ----------------------------------------------------- |
| 1  | **RFQs Processed**         | Total number of RFQ documents uploaded and parsed         | 50+ / day                | Measures system adoption and throughput               |
| 2  | **Quotes Generated**       | Total quotations successfully created from RFQs           | 95%+ of uploaded RFQs    | Tracks conversion from intake to actionable output    |
| 3  | **Approval Rate**          | Percentage of quotes approved on first review             | ≥ 85%                    | High rate = AI is generating accurate quotes          |
| 4  | **Avg. Response Time**     | Time from RFQ upload to quotation sent to customer        | < 30 minutes             | Speed wins deals — fastest responder often wins       |
| 5  | **Quote Conversion Rate**  | Percentage of sent quotes that become purchase orders     | ≥ 35%                    | Ultimate measure of quote quality and competitiveness |
| 6  | **Revenue Influenced**     | Total value (₹) of quotes generated by the system         | Track month-over-month   | Connects automation directly to business outcomes     |
| 7  | **Avg. Approval Time**     | Time between quote generation and manager approval        | < 15 minutes             | Identifies approval bottlenecks and SLA compliance    |

### KPI Tracking Architecture

```
 ┌─────────────────────────────────────────────────────────────────────┐
 │                   QUOTEFLOW AI — KPI PIPELINE                       │
 └─────────────────────────────────────────────────────────────────────┘

   Every workflow step emits events:

   📄 Upload ──► 🤖 Extract ──► 📦 Validate ──► 💰 Price ──► 📋 Quote ──► ✅ Approve
       │              │              │              │             │            │
       ▼              ▼              ▼              ▼             ▼            ▼
   ┌────────┐   ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐   ┌────────┐
   │ Event: │   │ Event: │    │ Event: │    │ Event: │    │ Event: │   │ Event: │
   │ RFQ    │   │ Items  │    │ Stock  │    │ Price  │    │ Quote  │   │ Status │
   │ Received│  │ Found  │    │ Checked│    │ Calc'd │    │ Created│   │ Changed│
   └───┬────┘   └───┬────┘    └───┬────┘    └───┬────┘    └───┬────┘   └───┬────┘
       │            │             │             │             │            │
       └────────────┴─────────────┴─────────────┴─────────────┴────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │   METRICS AGGREGATOR   │
                              │                       │
                              │  • Count events       │
                              │  • Calculate averages │
                              │  • Track durations    │
                              │  • Compute rates      │
                              └───────────┬───────────┘
                                          │
                              ┌───────────┴───────────┐
                              │                       │
                              ▼                       ▼
                   ┌─────────────────┐     ┌─────────────────┐
                   │   DASHBOARD     │     │   ALERTS        │
                   │                 │     │                 │
                   │ • Real-time KPIs│     │ • Approval SLA  │
                   │ • Trend charts  │     │   breach        │
                   │ • Ops dashboard │     │ • Error spikes  │
                   │ • Export to CSV │     │ • Low conversion│
                   └─────────────────┘     └─────────────────┘
```

### Metric Relationships

Understanding how KPIs connect to each other helps identify root causes:

```
  RFQs Processed
       │
       ├──► Quotes Generated  (extraction success rate)
       │         │
       │         ├──► Approval Rate  (quote accuracy)
       │         │         │
       │         │         ├──► Avg. Approval Time  (manager responsiveness)
       │         │         │
       │         │         └──► Revision Rate  (AI quality indicator)
       │         │
       │         └──► Quote Conversion Rate  (competitive positioning)
       │                   │
       │                   └──► Revenue Influenced  (business impact)
       │
       └──► Avg. Response Time  (end-to-end speed)
```

> **Insight for judges:** These are not vanity metrics — each KPI maps directly to a revenue or efficiency outcome that a CFO can evaluate.

---

## 60-Second Judge Demo Flow

This section provides a structured, repeatable demo script designed specifically for hackathon presentations. The entire RFQ-to-approved-quote workflow completes in **under 60 seconds**, making it ideal for time-constrained pitches.

### Why This Demo Works

| Strength                   | Explanation                                                 |
| -------------------------- | ----------------------------------------------------------- |
| **Visual & immediate**     | Judges see real data flowing through the system, not slides |
| **End-to-end in 60 secs**  | Proves the full workflow works, not just a single feature   |
| **Real business output**   | Produces a professional quotation — tangible, understandable|
| **Human-in-the-loop**      | Approval step shows responsible AI, not blind automation    |
| **Zero setup required**    | Sample RFQ included — no external dependencies needed       |
| **Memorable one-liner**    | "4 hours → 2 minutes" sticks with judges long after the demo|

### Demo Timeline

```
 ┌─────────────────────────────────────────────────────────────────────┐
 │              QUOTEFLOW AI — 60-SECOND DEMO SCRIPT                   │
 └─────────────────────────────────────────────────────────────────────┘

  TIME        ACTION                              WHAT JUDGES SEE
  ────        ──────                              ───────────────

  0:00  ──►   Open QuoteFlow AI                   Premium dark-mode UI
              in browser                          with glowing health badge
                    │
                    ▼
  0:10  ──►   Drag & drop the                     File name appears,
              sample RFQ file                     upload zone highlights
                    │
                    ▼
  0:20  ──►   Click "🚀 Generate                  Loading spinner,
              Quotation"                          then quote table renders
                    │
                    ▼
  0:30  ──►   AI extracts 5 products              Line items appear:
              from the RFQ                        HP Laptop, Dell Monitor,
                                                  Canon Printer, etc.
                    │
                    ▼
  0:38  ──►   Inventory checked,                  Fulfilled / Partial
              pricing calculated                  status badges, GST
                                                  breakdown visible
                    │
                    ▼
  0:45  ──►   Scroll to totals                    Subtotal → GST →
                                                  Grand Total (₹67.9L)
                    │
                    ▼
  0:50  ──►   Click "✅ Approve                   Status changes to
              Quotation"                          APPROVED, 🎉 banner
                    │
                    ▼
  0:55  ──►   Show API docs                       Swagger UI at /docs
              at /docs                            proves production-grade
                    │
                    ▼
  1:00  ──►   🎤 Deliver pitch                    "4 hours → 2 minutes."
              one-liner
```

### Step-by-Step Screenshot Guide

| Step | Time    | User Action                          | System Response                             | Key Talking Point                        |
| ---- | ------- | ------------------------------------ | ------------------------------------------- | ---------------------------------------- |
| 1    | 0:00    | Navigate to `localhost:5173`         | Hero section loads, API health = ✅ Online   | "This is QuoteFlow AI"                   |
| 2    | 0:10    | Drag `sample_rfq_1.txt` onto upload  | File name + size displayed in upload zone   | "A real RFQ from a company"              |
| 3    | 0:20    | Click "Generate Quotation"           | Spinner → quote table with 5 products       | "AI extracted all products & quantities" |
| 4    | 0:35    | Scroll through line items            | SKUs, prices, availability, line totals     | "Live inventory cross-reference"         |
| 5    | 0:42    | Point to pricing section             | Subtotal, 18% GST, Grand Total in INR      | "Automatic tax computation"              |
| 6    | 0:50    | Click "Approve Quotation"            | ✅ APPROVED badge, 🎉 confirmation banner    | "Human-in-the-loop — responsible AI"     |
| 7    | 0:55    | Navigate to `/docs`                  | Full Swagger API documentation              | "Production-grade API"                   |

### Pitch Script (for the presenter)

```
 "Every day, B2B sales teams spend 2 to 4 hours manually creating
  quotations from RFQ documents.

  They open the PDF. They read each line. They check inventory.
  They calculate prices. They format a quote. They wait for approval.

  QuoteFlow AI does all of this in under 2 minutes.

  Watch — I'll upload a real RFQ right now.

  [Upload file → Generate → Approve]

  That's it. Five products extracted. Inventory validated.
  Pricing calculated with GST. Manager approved.

  From 4 hours to 2 minutes. That's QuoteFlow AI."
```

### Demo Checklist (Pre-Presentation)

- [ ] Backend running (see command note below)
- [ ] Frontend running: `npm run dev` (in `frontend/`)
- [ ] Health badge shows ✅ **API Online**
- [ ] `sample_rfq_1.txt` downloaded and ready on Desktop
- [ ] Browser zoom set to 100% for readability
- [ ] Swagger docs accessible at `localhost:8000/docs`
- [ ] Screen resolution ≥ 1920×1080 for full table visibility

> **Backend startup command** — the import path depends on your working directory:
>
> | Working Directory  | Command                                   |
> | ------------------ | ----------------------------------------- |
> | Project root       | `uvicorn backend.main:app --reload`       |
> | `backend/` folder  | `uvicorn main:app --reload`               |
>
> Both start the server on `http://localhost:8000`. Choose whichever matches your terminal's current directory.

---

## Assumptions for MVP

The following assumptions scope the MVP delivered for the FlowZint AI Hackathon 2026. They define what is **intentionally simplified** and what will be extended in production.

| #  | Assumption                                                                         |
| -- | ---------------------------------------------------------------------------------- |
| 1  | Inventory data is stored in a **mock JSON database** (`database/inventory.json`)   |
| 2  | RFQ files are limited to **PDF and TXT** formats only                              |
| 3  | Pricing is based on **predefined unit prices** in the inventory — no dynamic rules |
| 4  | Manager approval is **simulated through the frontend UI** (client-side state)      |
| 5  | Email and WhatsApp delivery are **future enhancements**, not implemented in MVP    |
| 6  | No user authentication or role-based access control is required                    |
| 7  | AI extraction uses simplified parsing; **full Gemini integration** is planned      |
| 8  | All monetary values are in **INR** with a fixed **18% GST** rate                   |

> These constraints are deliberate — they let the team ship a working demo within the hackathon timeline while maintaining a clear upgrade path for every item.

---

> 📐 **See also**: [architecture.md](./architecture.md) for system architecture and technical stack.

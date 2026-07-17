/**
 * QuoteFlow AI — API Service Layer
 * ==================================
 * Reusable Axios-based functions for communicating with the FastAPI backend.
 *
 * All functions return Axios response objects so that callers can access
 * both `response.data` and HTTP metadata (`status`, `headers`, etc.).
 *
 * Base URL is resolved from the VITE_API_BASE_URL environment variable
 * or defaults to http://localhost:8000 for local development.
 */

import axios from "axios";

// ---------------------------------------------------------------------------
// Axios Instance — shared configuration
// ---------------------------------------------------------------------------

const VITE_API_URL =
  import.meta.env?.VITE_API_URL ||
  import.meta.env?.VITE_API_BASE_URL ||
  "http://localhost:8000";

const apiClient = axios.create({
  baseURL: VITE_API_URL,
  timeout: 30_000, // 30 seconds — generous for AI processing
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const API_ENDPOINTS = {
  HEALTH: "/health",
  RFQ_UPLOAD: "/api/v1/rfq/upload",
  QUOTE_GENERATE: "/api/v1/quote/generate",
  INVENTORY: "/api/v1/inventory",
  APPROVE_QUOTE: "/api/v1/quote/approve",
  REJECT_QUOTE: "/api/v1/quote/reject",
};

// ---------------------------------------------------------------------------
// Request / Response Interceptors (logging in dev)
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env?.DEV) {
      console.log(
        `[QuoteFlow API] ${config.method?.toUpperCase()} ${config.url}`
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred";

    if (import.meta.env?.DEV) {
      console.error("[QuoteFlow API] Error:", message);
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

const isRetryableError = (error) => {
  if (!error.response || error.message === "Network Error" || error.code === "ECONNABORTED") {
    return true;
  }
  const status = error.response.status;
  if ([400, 401, 403, 404, 422].includes(status)) {
    return false;
  }
  if ([500, 502, 503, 504].includes(status)) {
    return true;
  }
  return false;
};

const withRetry = async (fn, retries = 2) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await withRetry(fn, retries - 1);
    }
    throw error;
  }
};

/**
 * @typedef {Object} RFQItem
 * @property {string} product
 * @property {number} quantity
 *
 * @typedef {Object} RFQPayload
 * @property {string} rfq_id
 * @property {RFQItem[]} items
 */

/**
 * Health Check
 * GET /health
 *
 * Verifies that the backend is reachable and all components are operational.
 *
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export const checkHealth = () =>
  withRetry(() =>
    apiClient.get(API_ENDPOINTS.HEALTH).then((res) => res.data)
  );

/**
 * Upload RFQ Document
 * POST /api/v1/rfq/upload
 *
 * Sends an RFQ file (PDF or TXT) to the backend for text extraction.
 *
 * @param {File} file - The RFQ document selected by the user.
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export const uploadRFQ = (file) => {
  if (!file || file.size === 0) {
    throw new Error("Invalid RFQ file");
  }
  
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post(API_ENDPOINTS.RFQ_UPLOAD, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60_000, // allow extra time for large PDFs
  });
};

/**
 * Generate Quotation
 * POST /api/v1/quote/generate
 *
 * Submits structured RFQ data (extracted products + quantities) and
 * receives a fully priced quotation in return.
 *
 * @param {RFQPayload} rfqData - The structured RFQ payload.
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export const generateQuote = (rfqData) =>
  apiClient.post(API_ENDPOINTS.QUOTE_GENERATE, rfqData);

/**
 * Fetch Inventory
 * GET /api/v1/inventory
 *
 * Retrieves the full product catalogue with stock levels and pricing.
 *
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export const getInventory = () => withRetry(() => apiClient.get(API_ENDPOINTS.INVENTORY));

/**
 * Approve Quotation
 * POST /api/v1/quote/approve
 *
 * Marks a generated quotation as approved.
 *
 * @param {Object} payload - The approval payload
 * @param {string} payload.quote_id - The ID of the quote to approve
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export const approveQuote = (payload) =>
  apiClient.post(API_ENDPOINTS.APPROVE_QUOTE, payload);

/**
 * Reject Quotation
 * POST /api/v1/quote/reject
 *
 * Marks a generated quotation as rejected.
 *
 * @param {Object} payload - The rejection payload
 * @param {string} payload.quote_id - The ID of the quote to reject
 * @param {string} payload.reason - The reason for rejection
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export const rejectQuote = (payload) =>
  apiClient.post(API_ENDPOINTS.REJECT_QUOTE, payload);

// ---------------------------------------------------------------------------
// Default export — the configured Axios instance for ad-hoc requests
// ---------------------------------------------------------------------------

export default apiClient;

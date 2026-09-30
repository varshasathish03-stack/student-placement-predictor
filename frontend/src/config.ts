/**
 * frontend/src/config.ts
 * Central configuration for API URL with environment variable support for cloud deployment.
 */
export const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://localhost:8000';

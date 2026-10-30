/**
 * config.js
 * Application configuration and dynamic API / WebSocket URL resolution.
 * - In local development: defaults to relative paths using Vite proxy (zero config).
 * - In production (Render, Vercel, Netlify): uses VITE_API_URL / VITE_WS_URL environment variables.
 */

export const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : '';

export function getWsUrl() {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL.replace(/\/$/, '') + '/dashboard-events';
  }
  if (API_BASE) {
    const wsBase = API_BASE.replace(/^http/, 'ws');
    return `${wsBase}/dashboard-events`;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/dashboard-events`;
}

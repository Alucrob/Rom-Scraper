/* ═══════════════════════════════════════════════════
   STEALTH MANAGER — Central config + method dispatch
   Runs in main process
   ═══════════════════════════════════════════════════ */

const path = require('path');
const fs = require('fs');
const { getRandomUA } = require('./user-agents');

const DEFAULTS_PATH = path.join(__dirname, '..', '..', '..', 'config', 'stealth-defaults.json');

let config = null;

function loadConfig() {
  try {
    const raw = fs.readFileSync(DEFAULTS_PATH, 'utf8');
    config = JSON.parse(raw);
  } catch {
    config = { agentMode: false, methods: {} };
  }
  return config;
}

function getConfig() {
  if (!config) loadConfig();
  return config;
}

function updateConfig(newConfig) {
  config = newConfig;
}

function isEnabled(methodId) {
  if (!config) loadConfig();
  return config.methods?.[methodId]?.enabled || false;
}

function setEnabled(methodId, enabled) {
  if (!config) loadConfig();
  if (config.methods[methodId]) {
    config.methods[methodId].enabled = enabled;
  }
}

function isAgentMode() {
  if (!config) loadConfig();
  return config.agentMode || false;
}

/* ── Stealth Method Implementations ── */

// 1. User-Agent Rotation
function getRotatedUA() {
  if (!isEnabled('user-agent-rotation')) return null;
  return getRandomUA();
}

// 3. HTTP Header Spoofing
const ACCEPT_LANGUAGES = [
  'en-US,en;q=0.9',
  'en-GB,en;q=0.9',
  'en-US,en;q=0.9,fr;q=0.8',
  'en-US,en;q=0.9,de;q=0.8',
  'en-US,en;q=0.9,es;q=0.8',
  'en-US,en;q=0.9,ja;q=0.8',
  'en,en-US;q=0.9',
];

function getSpoofedHeaders(targetUrl) {
  if (!isEnabled('header-spoofing')) return {};
  const headers = {};
  headers['Accept-Language'] = ACCEPT_LANGUAGES[Math.floor(Math.random() * ACCEPT_LANGUAGES.length)];
  headers['DNT'] = Math.random() > 0.5 ? '1' : '0';
  // Sec-Fetch headers to look more browser-like
  headers['Sec-Fetch-Dest'] = 'document';
  headers['Sec-Fetch-Mode'] = 'navigate';
  headers['Sec-Fetch-Site'] = 'none';
  headers['Sec-Fetch-User'] = '?1';
  return headers;
}

// 4. Exponential Backoff
function getBackoffDelay(attempt) {
  if (!isEnabled('exponential-backoff')) return 0;
  return Math.min(Math.pow(2, attempt) * 1000, 32000); // 2s, 4s, 8s, 16s, 32s max
}

// 5. Randomized Request Jitter
function getJitterDelay() {
  if (!isEnabled('request-jitter')) return 0;
  return 500 + Math.random() * 2500; // 0.5s to 3s
}

// 8. Referrer Spoofing
const REFERRER_SOURCES = [
  'https://www.google.com/search?q=',
  'https://www.google.com/',
  'https://duckduckgo.com/?q=',
  'https://www.bing.com/search?q=',
  'https://search.yahoo.com/search?p=',
  'https://t.co/',
  'https://www.reddit.com/',
];

function getSpoofedReferrer(targetUrl) {
  if (!isEnabled('referrer-spoofing')) return '';
  try {
    const host = new URL(targetUrl).hostname;
    // 50% chance of search engine referrer, 50% chance of internal
    if (Math.random() > 0.5) {
      const src = REFERRER_SOURCES[Math.floor(Math.random() * REFERRER_SOURCES.length)];
      return src + encodeURIComponent(host);
    }
    return `https://${host}/`;
  } catch {
    return REFERRER_SOURCES[0];
  }
}

// 13. Honeypot Detection
function isHoneypotLink(html, linkUrl) {
  if (!isEnabled('honeypot-detection')) return false;
  // Check if the link appears within a display:none or visibility:hidden element
  const escaped = linkUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`style\\s*=\\s*["'][^"']*(?:display\\s*:\\s*none|visibility\\s*:\\s*hidden)[^"']*["'][^>]*(?:href\\s*=\\s*["']${escaped}|${escaped})`, 'i');
  return pattern.test(html);
}

/* ── Aggregate: build request options ── */
function buildRequestHeaders(targetUrl, baseHeaders = {}) {
  const headers = { ...baseHeaders };

  // User-Agent rotation
  const ua = getRotatedUA();
  if (ua) headers['User-Agent'] = ua;

  // Header spoofing
  const spoofed = getSpoofedHeaders(targetUrl);
  Object.assign(headers, spoofed);

  // Referrer spoofing
  const ref = getSpoofedReferrer(targetUrl);
  if (ref) headers['Referer'] = ref;

  return headers;
}

module.exports = {
  loadConfig,
  getConfig,
  updateConfig,
  isEnabled,
  setEnabled,
  isAgentMode,
  getRotatedUA,
  getSpoofedHeaders,
  getBackoffDelay,
  getJitterDelay,
  getSpoofedReferrer,
  isHoneypotLink,
  buildRequestHeaders,
};

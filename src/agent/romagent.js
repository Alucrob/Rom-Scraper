/* ═══════════════════════════════════════════════════
   ROMAGENT — Dynamic Orchestration State Machine
   Runs in main process. Monitors scrape activity,
   detects blocks, and adapts stealth methods.
   ═══════════════════════════════════════════════════ */

const stealth = require('../js/stealth/stealth-manager');

// Method priority order for escalation
const ESCALATION_ORDER = [
  'user-agent-rotation',
  'header-spoofing',
  'referrer-spoofing',
  'request-jitter',
  'exponential-backoff',
  'honeypot-detection',
  'cookie-persistence',
  'proxy-rotation',
  'tls-fingerprint',
  'browser-fingerprint',
  'protocol-rotation',
  'headless-browser',
  'human-simulation',
  'geolocation-spoofing',
  'captcha-solver',
];

class RomAgent {
  constructor() {
    this.active = false;
    this.domainStats = {};  // domain -> { successes, failures, lastMethod, methodScores }
    this.currentEscalation = 0;
    this.sendLog = null;
    this.consecutiveFailures = 0;
    this.maxConsecutiveBeforeEscalate = 3;
  }

  start(logFn) {
    this.active = true;
    this.sendLog = logFn;
    this.consecutiveFailures = 0;
    this.currentEscalation = 0;

    // Enable baseline methods
    const baseline = ['user-agent-rotation', 'header-spoofing', 'referrer-spoofing', 'request-jitter', 'exponential-backoff', 'honeypot-detection'];
    baseline.forEach(id => stealth.setEnabled(id, true));

    this.log('ROMAGENT initialized. Baseline stealth methods activated.');
    this.log(`Monitoring for blocks. Will escalate after ${this.maxConsecutiveBeforeEscalate} consecutive failures.`);
  }

  stop() {
    this.active = false;
    this.log('ROMAGENT deactivated.');
  }

  log(msg) {
    if (this.sendLog) this.sendLog(msg);
  }

  /* Called by the scrape handler on each request result */
  onRequestResult(domain, statusCode, success) {
    if (!this.active) return;

    // Init domain stats
    if (!this.domainStats[domain]) {
      this.domainStats[domain] = { successes: 0, failures: 0, methodScores: {} };
    }

    const stats = this.domainStats[domain];

    if (success) {
      stats.successes++;
      this.consecutiveFailures = 0;

      // Record which methods are currently working
      const config = stealth.getConfig();
      if (config.methods) {
        Object.entries(config.methods).forEach(([id, m]) => {
          if (m.enabled) {
            stats.methodScores[id] = (stats.methodScores[id] || 0) + 1;
          }
        });
      }
    } else {
      stats.failures++;
      this.consecutiveFailures++;

      if (this.consecutiveFailures >= this.maxConsecutiveBeforeEscalate) {
        this.escalate(domain, statusCode);
        this.consecutiveFailures = 0;
      }
    }
  }

  /* Escalate: enable the next stealth method in the chain */
  escalate(domain, statusCode) {
    if (!this.active) return;

    // Find next disabled method to enable
    const config = stealth.getConfig();
    let escalated = false;

    for (let i = this.currentEscalation; i < ESCALATION_ORDER.length; i++) {
      const methodId = ESCALATION_ORDER[i];
      if (config.methods[methodId] && !config.methods[methodId].enabled) {
        stealth.setEnabled(methodId, true);
        this.currentEscalation = i + 1;
        const methodName = config.methods[methodId].name || methodId;

        if (statusCode === 403) {
          this.log(`Block detected (HTTP 403) on ${domain}. Enabling: ${methodName}`);
        } else if (statusCode === 429) {
          this.log(`Rate limited (HTTP 429) on ${domain}. Enabling: ${methodName}`);
        } else {
          this.log(`Failure (HTTP ${statusCode}) on ${domain}. Switching to: ${methodName}`);
        }

        escalated = true;
        break;
      }
    }

    if (!escalated) {
      this.log(`All stealth methods exhausted for ${domain}. Maximum evasion active.`);
    }
  }

  /* Get recommended jitter for a domain based on learned stats */
  getAdaptiveDelay(domain) {
    if (!this.active) return 0;

    const stats = this.domainStats[domain];
    if (!stats) return stealth.getJitterDelay();

    const failRate = stats.failures / Math.max(stats.successes + stats.failures, 1);

    // Higher fail rate = longer delays
    if (failRate > 0.5) return 2000 + Math.random() * 3000;
    if (failRate > 0.2) return 1000 + Math.random() * 2000;
    return stealth.getJitterDelay();
  }

  /* Get domain-specific method scores for feedback loop */
  getDomainReport() {
    return { ...this.domainStats };
  }
}

module.exports = { RomAgent };

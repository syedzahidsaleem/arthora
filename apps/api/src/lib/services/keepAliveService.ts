/**
 * Autonomous Anti-Downtime & Keep-Alive Service
 *
 * Render's free tier spins down web services after 15 minutes of inactivity.
 * This service runs inside the API and periodically sends outbound HTTP requests
 * to its own public URL (e.g., https://arthora-api.onrender.com/health) via
 * Render's public router, resetting the inactivity countdown timer to prevent sleeping.
 */

export interface KeepAliveConfig {
  targetUrl: string;
  intervalMs: number;
}

export function getKeepAliveConfig(): KeepAliveConfig | null {
  const isProduction = process.env.NODE_ENV === 'production';
  const customUrl = process.env.SELF_PING_URL || process.env.KEEP_ALIVE_URL;
  const renderUrl = process.env.RENDER_EXTERNAL_URL;
  const defaultProductionUrl = 'https://arthora-api.onrender.com';

  const targetUrl = customUrl || renderUrl || (isProduction ? defaultProductionUrl : null);

  if (!targetUrl) {
    return null;
  }

  // Default to 10 minutes (600,000 ms), well below Render's 15-minute idle limit
  const intervalMs = parseInt(process.env.KEEP_ALIVE_INTERVAL_MS || '600000', 10);

  return {
    targetUrl: targetUrl.replace(/\/+$/, ''),
    intervalMs: Math.max(60000, intervalMs), // Minimum 1 minute safety floor
  };
}

let keepAliveTimer: NodeJS.Timeout | null = null;

/**
 * Starts the autonomous anti-downtime self-ping loop.
 */
export function startKeepAliveBot(): NodeJS.Timeout | null {
  if (keepAliveTimer) {
    return keepAliveTimer;
  }

  const config = getKeepAliveConfig();
  if (!config) {
    console.log('ℹ️ [Keep-Alive Bot] Standby (no public target URL configured for non-production environment).');
    return null;
  }

  const intervalMinutes = Math.round(config.intervalMs / 60000);
  console.log(`🛡️ [Keep-Alive Bot] Anti-downtime bot active. Pinging ${config.targetUrl}/health every ${intervalMinutes}m to prevent sleep.`);

  async function pingHealthEndpoint(): Promise<void> {
    const healthUrl = `${config!.targetUrl}/health`;
    const startTime = Date.now();

    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Arthora-AntiDowntimeBot/1.0 (+https://arthora.in)',
          'X-Bot-Purpose': 'keep-alive-heartbeat',
        },
      });

      const latencyMs = Date.now() - startTime;
      if (response.ok) {
        console.log(`💚 [Keep-Alive Bot] Heartbeat success (HTTP ${response.status}, ${latencyMs}ms) - Inactivity reset`);
      } else {
        console.warn(`⚠️ [Keep-Alive Bot] Heartbeat probe returned non-200 status (HTTP ${response.status}, ${latencyMs}ms)`);
      }
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ [Keep-Alive Bot] Heartbeat probe error after ${latencyMs}ms: ${message}`);
    }
  }

  // Schedule recurring heartbeat
  keepAliveTimer = setInterval(pingHealthEndpoint, config.intervalMs);

  // Unref timer so it does not block graceful Node.js shutdown
  if (keepAliveTimer.unref) {
    keepAliveTimer.unref();
  }

  return keepAliveTimer;
}

/**
 * Stops the anti-downtime bot during server shutdown.
 */
export function stopKeepAliveBot(): void {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
    console.log('🛑 [Keep-Alive Bot] Heartbeat timer stopped.');
  }
}

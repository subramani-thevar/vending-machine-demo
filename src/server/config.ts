export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  serverHost: process.env.SERVER_HOST || 'localhost',
  resetIntervalMs: getResetInterval(),
  logLevel: process.env.LOG_LEVEL || 'info',
  maxConnections: parseInt(process.env.MAX_CONNECTIONS || '100', 10),
} as const;

function getResetInterval(): number {
  const raw = parseInt(process.env.RESET_INTERVAL_MS || '300000', 10);
  const MIN = 60000;
  const MAX = 3600000;
  const DEFAULT = 300000;

  if (isNaN(raw) || raw < MIN || raw > MAX) {
    return DEFAULT;
  }
  return raw;
}

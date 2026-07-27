import { EventEmitter } from 'events';
import { config } from '../config.js';
import { logger } from '../logger.js';

export class TimerService extends EventEmitter {
  private timeout: NodeJS.Timeout | null = null;
  private tickInterval: NodeJS.Timeout | null = null;
  private running = false;
  private startedAt: Date | null = null;
  private expiresAt: Date | null = null;
  private readonly intervalMs: number;

  constructor() {
    super();
    this.intervalMs = config.resetIntervalMs;
  }

  start(): void {
    this.stop();

    this.running = true;
    this.startedAt = new Date();
    this.expiresAt = new Date(Date.now() + this.intervalMs);

    logger.info('Timer started', { expiresAt: this.expiresAt.toISOString(), intervalMs: this.intervalMs });

    // Set the main timeout
    this.timeout = setTimeout(() => {
      this.onExpire();
    }, this.intervalMs);

    // Set tick interval for countdown updates
    this.startTicking();
  }

  reset(): void {
    if (this.running) {
      logger.info('Timer reset (debounced)');
      this.start(); // Restart from full interval
    }
  }

  stop(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.running = false;
    this.startedAt = null;
    this.expiresAt = null;
  }

  getRemainingTime(): number {
    if (!this.running || !this.expiresAt) return 0;
    return Math.max(0, this.expiresAt.getTime() - Date.now());
  }

  getIntervalMs(): number {
    return this.intervalMs;
  }

  isRunning(): boolean {
    return this.running;
  }

  private startTicking(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }

    // Tick every 10 seconds, switch to 1s in final 30s
    const tick = () => {
      const remaining = this.getRemainingTime();
      this.emit('timer:tick', { resetIn: remaining });

      // Switch to faster ticking in final 30 seconds
      if (remaining <= 30000 && remaining > 0) {
        if (this.tickInterval) clearInterval(this.tickInterval);
        this.tickInterval = setInterval(() => {
          const r = this.getRemainingTime();
          this.emit('timer:tick', { resetIn: r });
        }, 1000);
      }
    };

    this.tickInterval = setInterval(tick, 10000);
    // Emit initial tick
    tick();
  }

  private onExpire(): void {
    logger.info('Timer expired, triggering reset');
    this.stop();
    this.emit('timer:expired');
  }
}

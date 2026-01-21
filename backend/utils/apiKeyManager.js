const logger = require('./logger');

class APIKeyManager {
  constructor() {
    this.keys = this.loadKeys();
    this.currentKeyIndex = 0;
    this.usage = new Map();
    this.limits = {
      daily: 1000,
      hourly: 100,
      perMinute: 10,
    };
  }

  loadKeys() {
    const keys = [];

    // Primary key
    if (process.env.GEMINI_API_KEY) {
      keys.push({
        key: process.env.GEMINI_API_KEY,
        id: 'primary',
        active: true,
      });
    }

    // Backup keys
    if (process.env.GEMINI_API_KEY_BACKUP) {
      keys.push({
        key: process.env.GEMINI_API_KEY_BACKUP,
        id: 'backup',
        active: true,
      });
    }

    if (keys.length === 0) {
      throw new Error('No API keys configured');
    }

    return keys;
  }

  getCurrentKey() {
    const key = this.keys[this.currentKeyIndex];
    if (!key || !key.active) {
      this.rotateKey();
      return this.getCurrentKey();
    }
    return key;
  }

  rotateKey() {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
    logger.info(`API key rotated to: ${this.keys[this.currentKeyIndex].id}`);
  }

  trackUsage(keyId) {
    const now = Date.now();
    const hour = Math.floor(now / (60 * 60 * 1000));
    const day = Math.floor(now / (24 * 60 * 60 * 1000));

    if (!this.usage.has(keyId)) {
      this.usage.set(keyId, {
        daily: new Map(),
        hourly: new Map(),
        total: 0,
      });
    }

    const keyUsage = this.usage.get(keyId);
    keyUsage.total++;
    keyUsage.daily.set(day, (keyUsage.daily.get(day) || 0) + 1);
    keyUsage.hourly.set(hour, (keyUsage.hourly.get(hour) || 0) + 1);

    // Cleanup old data
    this.cleanupUsageData(keyUsage);
  }

  cleanupUsageData(keyUsage) {
    const now = Date.now();
    const currentDay = Math.floor(now / (24 * 60 * 60 * 1000));
    const currentHour = Math.floor(now / (60 * 60 * 1000));

    // Keep only last 7 days
    for (const [day] of keyUsage.daily) {
      if (day < currentDay - 7) {
        keyUsage.daily.delete(day);
      }
    }

    // Keep only last 24 hours
    for (const [hour] of keyUsage.hourly) {
      if (hour < currentHour - 24) {
        keyUsage.hourly.delete(hour);
      }
    }
  }

  checkRateLimit(keyId) {
    const keyUsage = this.usage.get(keyId);
    if (!keyUsage) return true;

    const now = Date.now();
    const currentDay = Math.floor(now / (24 * 60 * 60 * 1000));
    const currentHour = Math.floor(now / (60 * 60 * 1000));

    const dailyUsage = keyUsage.daily.get(currentDay) || 0;
    const hourlyUsage = keyUsage.hourly.get(currentHour) || 0;

    if (dailyUsage >= this.limits.daily) {
      logger.warn(`Daily limit exceeded for key: ${keyId}`);
      return false;
    }

    if (hourlyUsage >= this.limits.hourly) {
      logger.warn(`Hourly limit exceeded for key: ${keyId}`);
      return false;
    }

    return true;
  }

  async getValidKey() {
    let attempts = 0;
    const maxAttempts = this.keys.length;

    while (attempts < maxAttempts) {
      const keyObj = this.getCurrentKey();

      if (this.checkRateLimit(keyObj.id)) {
        this.trackUsage(keyObj.id);
        return keyObj.key;
      }

      this.rotateKey();
      attempts++;
    }

    throw new Error('All API keys have exceeded rate limits');
  }

  getUsageStats() {
    const stats = {};
    for (const [keyId, usage] of this.usage) {
      const now = Date.now();
      const currentDay = Math.floor(now / (24 * 60 * 60 * 1000));
      const currentHour = Math.floor(now / (60 * 60 * 1000));

      stats[keyId] = {
        total: usage.total,
        today: usage.daily.get(currentDay) || 0,
        thisHour: usage.hourly.get(currentHour) || 0,
      };
    }
    return stats;
  }

  markKeyInactive(keyId) {
    const key = this.keys.find(k => k.id === keyId);
    if (key) {
      key.active = false;
      logger.error(`API key marked inactive: ${keyId}`);
    }
  }
}

module.exports = APIKeyManager;

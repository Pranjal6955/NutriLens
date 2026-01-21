const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class FileCleanup {
  constructor(uploadsDir) {
    this.uploadsDir = uploadsDir;
    this.maxAge = 24 * 60 * 60 * 1000; // 24 hours
  }

  async cleanupOldFiles() {
    try {
      if (!fs.existsSync(this.uploadsDir)) {
        return;
      }

      const files = fs.readdirSync(this.uploadsDir);
      const now = Date.now();
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > this.maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} old files from uploads`);
      }
    } catch (error) {
      logger.error('File cleanup error:', error);
    }
  }

  startCleanupSchedule() {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanupOldFiles();
    }, 60 * 60 * 1000);
    
    logger.info('File cleanup scheduler started');
  }
}

module.exports = FileCleanup;
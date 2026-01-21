const logger = require('./logger');

class ResourceManager {
  constructor() {
    this.activeStreams = new Set();
    this.activeRequests = new Map();
  }

  // Track active streams
  trackStream(stream, id) {
    this.activeStreams.add({ stream, id });
    logger.debug(`Stream tracked: ${id}`);
  }

  // Clean up stream
  cleanupStream(stream, id) {
    try {
      if (stream && typeof stream.destroy === 'function') {
        stream.destroy();
      }
      this.activeStreams.delete({ stream, id });
      logger.debug(`Stream cleaned: ${id}`);
    } catch (error) {
      logger.error(`Stream cleanup error: ${id}`, error);
    }
  }

  // Track request with timeout
  trackRequest(req, res, timeout = 30000) {
    const requestId = Date.now().toString();
    
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn(`Request timeout: ${requestId}`);
        res.status(408).json({ error: 'Request timeout' });
      }
      this.activeRequests.delete(requestId);
    }, timeout);

    this.activeRequests.set(requestId, { req, res, timer });
    
    // Cleanup on response finish
    res.on('finish', () => {
      clearTimeout(timer);
      this.activeRequests.delete(requestId);
    });

    return requestId;
  }

  // Force cleanup all resources
  forceCleanup() {
    // Cleanup streams
    for (const { stream, id } of this.activeStreams) {
      this.cleanupStream(stream, id);
    }

    // Cleanup requests
    for (const [id, { timer }] of this.activeRequests) {
      clearTimeout(timer);
      this.activeRequests.delete(id);
    }

    logger.info('Force cleanup completed');
  }

  getStats() {
    return {
      activeStreams: this.activeStreams.size,
      activeRequests: this.activeRequests.size
    };
  }
}

module.exports = new ResourceManager();
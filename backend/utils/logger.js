const logger = {
  formatMessage: (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    const formattedArgs = args
      .map(arg =>
        arg instanceof Error
          ? arg.stack
          : typeof arg === 'object'
            ? JSON.stringify(arg)
            : arg
      )
      .join(' ');

    return `[${timestamp}] [${level}] ${message} ${formattedArgs}`.trim();
  },

  info: (message, ...args) => {
    console.log(logger.formatMessage('INFO', message, ...args));
  },

  warn: (message, ...args) => {
    console.warn(logger.formatMessage('WARN', message, ...args));
  },

  error: (message, ...args) => {
    console.error(logger.formatMessage('ERROR', message, ...args));
  },

  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(logger.formatMessage('DEBUG', message, ...args));
    }
  },
};

module.exports = logger;

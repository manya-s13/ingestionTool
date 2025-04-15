const fs = require('fs');
const path = require('path');

/**
 * Custom logger utility
 */
class Logger {
  constructor(options = {}) {
    this.options = {
      logToConsole: true,
      logToFile: false,
      logLevel: 'info', // debug, info, warn, error
      logFilePath: path.join(__dirname, '../../logs'),
      logFileName: 'app.log',
      maxLogFileSize: 10 * 1024 * 1024, // 10MB
      ...options
    };
    
    // Create log directory if logging to file
    if (this.options.logToFile) {
      this.ensureLogDirectory();
    }
    
    // Log levels and their numeric values
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    // Current log level numeric value
    this.currentLevel = this.levels[this.options.logLevel] || 1;
  }
  
  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.options.logFilePath)) {
      fs.mkdirSync(this.options.logFilePath, { recursive: true });
    }
  }
  
  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @returns {string} Formatted log message
   */
  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }
  
  /**
   * Write log to file
   * @param {string} formattedMessage - Formatted log message
   */
  writeToFile(formattedMessage) {
    if (!this.options.logToFile) return;
    
    const logFilePath = path.join(this.options.logFilePath, this.options.logFileName);
    
    try {
      // Check if file exists and its size
      if (fs.existsSync(logFilePath)) {
        const stats = fs.statSync(logFilePath);
        
        // Rotate log file if it exceeds max size
        if (stats.size > this.options.maxLogFileSize) {
          const timestamp = new Date().toISOString().replace(/:/g, '-');
          fs.renameSync(
            logFilePath,
            path.join(this.options.logFilePath, `app-${timestamp}.log`)
          );
        }
      }
      
      // Append to log file
      fs.appendFileSync(logFilePath, formattedMessage + '\n');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }
  
  /**
   * Log debug message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  debug(message, data) {
    if (this.currentLevel <= this.levels.debug) {
      const formattedMessage = this.formatMessage('debug', message);
      
      if (this.options.logToConsole) {
        console.debug(formattedMessage, data || '');
      }
      
      this.writeToFile(formattedMessage + (data ? ` ${JSON.stringify(data)}` : ''));
    }
  }
  
  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  info(message, data) {
    if (this.currentLevel <= this.levels.info) {
      const formattedMessage = this.formatMessage('info', message);
      
      if (this.options.logToConsole) {
        console.info(formattedMessage, data || '');
      }
      
      this.writeToFile(formattedMessage + (data ? ` ${JSON.stringify(data)}` : ''));
    }
  }
  
  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  warn(message, data) {
    if (this.currentLevel <= this.levels.warn) {
      const formattedMessage = this.formatMessage('warn', message);
      
      if (this.options.logToConsole) {
        console.warn(formattedMessage, data || '');
      }
      
      this.writeToFile(formattedMessage + (data ? ` ${JSON.stringify(data)}` : ''));
    }
  }
  
  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Error|Object} error - Error object or additional data
   */
  error(message, error) {
    if (this.currentLevel <= this.levels.error) {
      const formattedMessage = this.formatMessage('error', message);
      
      if (this.options.logToConsole) {
        console.error(formattedMessage, error || '');
      }
      
      let errorDetails = '';
      if (error) {
        if (error instanceof Error) {
          errorDetails = ` ${JSON.stringify({
            message: error.message,
            name: error.name,
            stack: error.stack
          })}`;
        } else {
          errorDetails = ` ${JSON.stringify(error)}`;
        }
      }
      
      this.writeToFile(formattedMessage + errorDetails);
    }
  }
}

// Create default instance
const logger = new Logger({
  logToFile: process.env.NODE_ENV === 'production',
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
});

module.exports = logger;
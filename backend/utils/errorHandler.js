/**
 * Global error handler utility
 */
const errorHandler = {
    /**
     * Handles API errors and sends appropriate response
     * @param {Error} error - The error object
     * @param {Object} res - Express response object
     * @param {string} message - Custom error message
     * @param {number} status - HTTP status code (default: 500)
     */
    handleApiError: (error, res, message = 'Server error', status = 500) => {
      console.error(`API Error: ${message}`, error);
      
      return res.status(status).json({
        success: false,
        message: message || error.message,
        error: process.env.NODE_ENV === 'production' ? undefined : {
          name: error.name,
          stack: error.stack,
          details: error.details || error.message
        }
      });
    },
    
    /**
     * Creates an error response object
     * @param {string} message - Error message
     * @param {number} status - HTTP status code
     * @param {Object} details - Additional error details
     * @returns {Object} Error response object
     */
    createErrorResponse: (message, status = 500, details = null) => {
      return {
        success: false,
        message,
        status,
        details: process.env.NODE_ENV === 'production' ? undefined : details
      };
    },
    
    /**
     * Express middleware for handling route errors
     */
    errorMiddleware: (err, req, res, next) => {
      console.error('Unhandled error:', err);
      
      // Handle specific error types
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: err.details || err.message
        });
      }
      
      // Default error response
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? undefined : {
          name: err.name,
          stack: err.stack
        }
      });
    }
  };
  
  module.exports = errorHandler;
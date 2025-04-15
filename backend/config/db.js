/**
 * Database configuration module
 * This file handles database connection settings and configuration
 */

// Default ClickHouse configuration
const defaultClickHouseConfig = {
    host: process.env.CLICKHOUSE_HOST || 'localhost',
    port: process.env.CLICKHOUSE_PORT || 8123,
    database: process.env.CLICKHOUSE_DB || 'default',
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
    secure: process.env.CLICKHOUSE_SECURE === 'true'
  };
  
  // Load configuration from environment variables or use defaults
  const config = {
    clickhouse: defaultClickHouseConfig,
    
    // Upload directory configuration
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    
    // Maximum file size for uploads (in bytes)
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // Default: 10MB
    
    // Maximum number of records to process in one batch
    batchSize: parseInt(process.env.BATCH_SIZE || '1000', 10),
    
    // Timeout for database operations (in milliseconds)
    dbTimeout: parseInt(process.env.DB_TIMEOUT || '30000', 10) // Default: 30 seconds
  };
  
  module.exports = config;
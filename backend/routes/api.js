const express = require('express');
const router = express.Router();
const clickhouseRoutes = require('./clickhouse');
const flatfileRoutes = require('./flatfile');
const errorHandler = require('../utils/errorHandler');

// Mount sub-routes
router.use('/clickhouse', clickhouseRoutes);
router.use('/flatfile', flatfileRoutes);

// API status endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle 404 for API routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
router.use(errorHandler.errorMiddleware);

module.exports = router;
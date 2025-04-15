const express = require('express');
const router = express.Router();
const clickhouseController = require('../controllers/clickhouseController.js');
const ingestionController = require('../controllers/injestionController.js');

// Test connection
router.post('/test-connection', clickhouseController.testConnection);

// List tables
router.post('/list-tables', clickhouseController.listTables);

// Get table schema
router.post('/table-schema', clickhouseController.getTableSchema);

// Execute query
router.post('/execute-query', clickhouseController.executeQuery);

// Preview table data
router.post('/preview-data', clickhouseController.previewTableData);

// ClickHouse to flat file
router.post('/export-to-flatfile', ingestionController.clickhouseToFlatFile);

// Flat file to ClickHouse
router.post('/import-from-flatfile', ingestionController.flatFileToClickhouse);

// Joined tables export
router.post('/export-joined-tables', ingestionController.joinedClickhouseToFlatFile);

module.exports = router;
const express = require('express');
const router = express.Router();
const flatfileController = require('../controllers/flatfileController');

// Upload a flat file
router.post('/upload', 
  flatfileController.uploadFile(),
  flatfileController.handleFileUpload
);

// Preview flat file content
router.post('/preview', flatfileController.previewFile);

// List available files
router.get('/list', flatfileController.listFiles);

// Delete a file
router.post('/delete', flatfileController.deleteFile);

// Download a file
router.get('/download/:filePath', flatfileController.downloadFile);

module.exports = router;
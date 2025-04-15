const FlatFileService = require('../services/FlatFileService');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

class FlatFileController {
  // Middleware for file upload
  uploadFile() {
    return upload.single('file');
  }

  // Handle the upload process
  async handleFileUpload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        filePath: req.file.filename
      });
    } catch (error) {
      console.error('File upload error:', error);
      return res.status(500).json({
        success: false,
        message: `File upload failed: ${error.message}`
      });
    }
  }

  // Preview flat file content
  async previewFile(req, res) {
    try {
      const { filePath, delimiter, headers, rows } = req.body;

      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'Missing file path'
        });
      }

      const flatFileService = new FlatFileService();
      const fullFilePath = path.join(__dirname, '../../uploads', filePath);
      
      // Check if file exists
      if (!fs.existsSync(fullFilePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      const previewResult = await flatFileService.previewFlatFile(
        fullFilePath,
        { 
          delimiter: delimiter || ',',
          headers: headers === false ? false : true,
          rows: rows || 100
        }
      );

      if (!previewResult.success) {
        return res.status(400).json(previewResult);
      }

      return res.status(200).json(previewResult);
    } catch (error) {
      console.error('File preview error:', error);
      return res.status(500).json({
        success: false,
        message: `File preview failed: ${error.message}`
      });
    }
  }

  // Get list of available files
  async listFiles(req, res) {
    try {
      const uploadsDir = path.join(__dirname, '../../uploads');
      
      // Check if directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      fs.readdir(uploadsDir, (err, files) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: `Failed to read files directory: ${err.message}`
          });
        }

        return res.status(200).json({
          success: true,
          data: files,
          count: files.length
        });
      });
    } catch (error) {
      console.error('List files error:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to list files: ${error.message}`
      });
    }
  }

  // Delete a file
  async deleteFile(req, res) {
    try {
      const { filePath } = req.body;

      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'Missing file path'
        });
      }

      const fullFilePath = path.join(__dirname, '../../uploads', filePath);
      
      // Check if file exists
      if (!fs.existsSync(fullFilePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Delete the file
      fs.unlink(fullFilePath, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: `Failed to delete file: ${err.message}`
          });
        }

        return res.status(200).json({
          success: true,
          message: 'File deleted successfully'
        });
      });
    } catch (error) {
      console.error('Delete file error:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to delete file: ${error.message}`
      });
    }
  }

  // Download a file
  async downloadFile(req, res) {
    try {
      const { filePath } = req.params;

      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'Missing file path'
        });
      }

      const fullFilePath = path.join(__dirname, '../../uploads', filePath);
      
      // Check if file exists
      if (!fs.existsSync(fullFilePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Send the file
      return res.download(fullFilePath);
    } catch (error) {
      console.error('Download file error:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to download file: ${error.message}`
      });
    }
  }
}

module.exports = new FlatFileController();
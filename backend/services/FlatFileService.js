const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const { createObjectCsvWriter } = require('csv-writer');

class FlatFileService {
  constructor() {}

  async readFlatFile(filePath, options = { delimiter: ',', headers: true }) {
    return new Promise((resolve, reject) => {
      const data = [];
      const fileStream = fs.createReadStream(filePath);
      
      const csvStream = csv.parse({
        headers: options.headers,
        delimiter: options.delimiter
      })
        .on('data', (row) => {
          data.push(row);
        })
        .on('end', () => {
          resolve({ 
            success: true, 
            data, 
            count: data.length,
            schema: data.length > 0 ? Object.keys(data[0]) : []
          });
        })
        .on('error', (error) => {
          reject({ success: false, message: `Error reading file: ${error.message}` });
        });
      
      fileStream.pipe(csvStream);
    });
  }

  async writeFlatFile(data, filePath, options = { delimiter: ',', headers: true }) {
    try {
      // Ensure the directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Get headers from the first data row if available
      const headers = options.headers 
        ? (Array.isArray(options.headers) ? options.headers : Object.keys(data[0] || {}))
        : null;
      
      // Setup the CSV writer
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: headers ? headers.map(header => ({ id: header, title: header })) : undefined,
        delimiter: options.delimiter
      });
      
      // Write the data
      await csvWriter.writeRecords(data);
      
      return { 
        success: true, 
        message: 'File written successfully', 
        count: data.length,
        filePath
      };
    } catch (error) {
      console.error('Error writing file:', error);
      return { success: false, message: `Failed to write file: ${error.message}` };
    }
  }

  async previewFlatFile(filePath, options = { delimiter: ',', headers: true, rows: 100 }) {
    try {
      const result = await this.readFlatFile(filePath, options);
      
      if (!result.success) {
        return result;
      }
      
      return {
        success: true,
        data: result.data.slice(0, options.rows),
        count: result.data.length,
        schema: result.schema
      };
    } catch (error) {
      console.error('Error previewing file:', error);
      return { success: false, message: `Failed to preview file: ${error.message}` };
    }
  }
}

module.exports = FlatFileService;
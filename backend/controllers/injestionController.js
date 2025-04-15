const ClickHouseService = require('../services/ClickHouseService.js');
const FlatFileService = require('../services/FlatFileService.js');
const path = require('path');
const fastcsv = require('fast-csv');

class IngestionController {
  async clickhouseToFlatFile(req, res) {
    try {
      const {
        host,
        port,
        database,
        username,
        password,
        jwt,
        secure,
        tableName,
        selectedColumns,
        outputFileName,
        delimiter,
        conditions
      } = req.body;

      // Validate required fields
      if (!host || !port || !database || !jwt || !tableName || !selectedColumns || !outputFileName) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Setup ClickHouse service
      const clickhouseService = new ClickHouseService({
        host,
        port,
        database,
        username,
        password,
        secure: secure === true || secure === 'true'
      });

      // Connect to ClickHouse
      const connectResult = await clickhouseService.connect();
      if (!connectResult.success) {
        return res.status(400).json(connectResult);
      }

      // Export data from ClickHouse
      const exportResult = await clickhouseService.exportToFlatFile(
        tableName,
        selectedColumns,
        { conditions }
      );

      if (!exportResult.success) {
        return res.status(400).json(exportResult);
      }

      // Write to flat file
      const flatFileService = new FlatFileService();
      const outputPath = path.join(__dirname, '../../uploads', outputFileName);
      
      const writeResult = await flatFileService.writeFlatFile(
        exportResult.data,
        outputPath,
        { 
          delimiter: delimiter || ',',
          headers: selectedColumns
        }
      );

      if (!writeResult.success) {
        return res.status(500).json(writeResult);
      }

      // Disconnect from ClickHouse
      clickhouseService.disconnect();

      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Data successfully exported to flat file',
        count: exportResult.count,
        filePath: outputFileName
      });
    } catch (error) {
      console.error('ClickHouse to flat file error:', error);
      return res.status(500).json({
        success: false,
        message: `Error during data export: ${error.message}`
      });
    }
  }

  // Flat File to ClickHouse
  async flatFileToClickhouse(req, res) {
    try {
      const {
        host,
        port,
        database,
        username,
        password,
        jwt,
        secure,
        tableName,
        selectedColumns,
        filePath,
        delimiter
      } = req.body;

      // Validate required fields
      if (!host || !port || !database || !jwt || !tableName || !selectedColumns || !filePath) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Setup services
      const clickhouseService = new ClickHouseService({
        host,
        port,
        database,
        username,
        password,
        secure: secure === true || secure === 'true'
      });
      
      const flatFileService = new FlatFileService();
      const fullFilePath = path.join(__dirname, '../../uploads', filePath);

      // Connect to ClickHouse
      const connectResult = await clickhouseService.connect();
      if (!connectResult.success) {
        return res.status(400).json(connectResult);
      }

      // Read data from flat file
      const readResult = await flatFileService.readFlatFile(
        fullFilePath,
        { 
          delimiter: delimiter || ',',
          headers: true
        }
      );

      if (!readResult.success) {
        return res.status(400).json(readResult);
      }

      // Import data to ClickHouse
      const importResult = await clickhouseService.importFromFlatFile(
        tableName,
        selectedColumns,
        readResult.data
      );

      // Disconnect from ClickHouse
      clickhouseService.disconnect();

      if (!importResult.success) {
        return res.status(400).json(importResult);
      }

      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Data successfully imported to ClickHouse',
        count: importResult.count
      });
    } catch (error) {
      console.error('Flat file to ClickHouse error:', error);
      return res.status(500).json({
        success: false,
        message: `Error during data import: ${error.message}`
      });
    }
  }

  // Handle joined tables export
  async joinedClickhouseToFlatFile(req, res) {
    try {
      const {
        host,
        port,
        database,
        username,
        password,
        jwt,
        secure,
        tables,
        joinConditions,
        selectedColumns,
        outputFileName,
        delimiter,
        conditions
      } = req.body;

      // Validate required fields
      if (!host || !port || !database || !jwt || !tables || !tables.length || 
          !joinConditions || !selectedColumns || !outputFileName) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields for join operation'
        });
      }

      // Setup ClickHouse service
      const clickhouseService = new ClickHouseService({
        host,
        port,
        database,
        username,
        password,
        secure: secure === true || secure === 'true'
      });

      // Connect to ClickHouse
      const connectResult = await clickhouseService.connect();
      if (!connectResult.success) {
        return res.status(400).json(connectResult);
      }

      // Execute join operation
      const joinResult = await clickhouseService.executeJoin(
        tables,
        joinConditions,
        selectedColumns,
        { conditions }
      );

      if (!joinResult.success) {
        return res.status(400).json(joinResult);
      }

      // Write to flat file
      const flatFileService = new FlatFileService();
      const outputPath = path.join(__dirname, '../../uploads', outputFileName);
      
      const writeResult = await flatFileService.writeFlatFile(
        joinResult.data,
        outputPath,
        { 
          delimiter: delimiter || ',',
          headers: selectedColumns
        }
      );

      // Disconnect from ClickHouse
      clickhouseService.disconnect();

      if (!writeResult.success) {
        return res.status(500).json(writeResult);
      }

      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Joined data successfully exported to flat file',
        count: joinResult.count,
        filePath: outputFileName
      });
    } catch (error) {
      console.error('Joined ClickHouse to flat file error:', error);
      return res.status(500).json({
        success: false,
        message: `Error during joined data export: ${error.message}`
      });
    }
  }

  // Test connection to ClickHouse
  async testClickHouseConnection(req, res) {
    try {
      const { host, port, database, username, password, jwt, secure } = req.body;

      // Validate required fields
      if (!host || !port || !database || !jwt) {
        return res.status(400).json({
          success: false,
          message: 'Missing required connection fields'
        });
      }

      // Setup and test connection
      const clickhouseService = new ClickHouseService({
        host,
        port,
        database,
        username,
        password,
        secure: secure === true || secure === 'true'
      });

      const connectResult = await clickhouseService.connect();
      
      // Disconnect regardless of result
      if (connectResult.success) {
        clickhouseService.disconnect();
      }

      return res.status(connectResult.success ? 200 : 400).json(connectResult);
    } catch (error) {
      console.error('Test connection error:', error);
      return res.status(500).json({
        success: false,
        message: `Connection test failed: ${error.message}`
      });
    }
  }

  // List tables in ClickHouse
  async listClickHouseTables(req, res) {
    try {
      const { host, port, database, username, password, jwt, secure } = req.body;

      // Validate required fields
      if (!host || !port || !database || !jwt) {
        return res.status(400).json({
          success: false,
          message: 'Missing required connection fields'
        });
      }

      // Setup connection
      const clickhouseService = new ClickHouseService({
        host,
        port,
        database,
        username,
        password,
        secure: secure === true || secure === 'true'
      });

      // Connect and list tables
      const connectResult = await clickhouseService.connect();
      if (!connectResult.success) {
        return res.status(400).json(connectResult);
      }

      const tablesResult = await clickhouseService.listTables();
      
      // Disconnect
      clickhouseService.disconnect();

      if (!tablesResult.success) {
        return res.status(400).json(tablesResult);
      }

      return res.status(200).json(tablesResult);
    } catch (error) {
      console.error('List tables error:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to list tables: ${error.message}`
      });
    }
  }

  // Get table schema
  async getClickHouseTableSchema(req, res) {
    try {
      const { host, port, database, username, password, jwt, secure, tableName } = req.body;

      // Validate required fields
      if (!host || !port || !database || !jwt || !tableName) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Setup connection
      const clickhouseService = new ClickHouseService({
        host,
        port,
        database,
        username,
        password,
        secure: secure === true || secure === 'true'
      });

      // Connect and get schema
      const connectResult = await clickhouseService.connect();
      if (!connectResult.success) {
        return res.status(400).json(connectResult);
      }

      const schemaResult = await clickhouseService.getTableSchema(tableName);
      
      // Disconnect
      clickhouseService.disconnect();

      if (!schemaResult.success) {
        return res.status(400).json(schemaResult);
      }

      return res.status(200).json(schemaResult);
    } catch (error) {
      console.error('Get schema error:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to get schema: ${error.message}`
      });
    }
  }

  // Preview data
  async previewData(req, res) {
    try {
      const { 
        source, 
        host, port, database, username, password, jwt, secure, tableName, selectedColumns,
        filePath, delimiter
      } = req.body;

      // Check source type
      if (source === 'clickhouse') {
        // ClickHouse preview logic
        if (!host || !port || !database || !jwt || !tableName) {
          return res.status(400).json({
            success: false,
            message: 'Missing required fields for ClickHouse preview'
          });
        }

        const clickhouseService = new ClickHouseService({
          host,
          port,
          database,
          username,
          password,
          secure: secure === true || secure === 'true'
        });

        const connectResult = await clickhouseService.connect();
        if (!connectResult.success) {
          return res.status(400).json(connectResult);
        }

        const previewResult = await clickhouseService.previewTableData(
          tableName,
          selectedColumns,
          100
        );
        
        clickhouseService.disconnect();
        
        if (!previewResult.success) {
          return res.status(400).json(previewResult);
        }

        return res.status(200).json(previewResult);
      } 
      else if (source === 'flatfile') {
        // Flat file preview logic
        if (!filePath) {
          return res.status(400).json({
            success: false,
            message: 'Missing file path for flat file preview'
          });
        }

        const flatFileService = new FlatFileService();
        const fullFilePath = path.join(__dirname, '../../uploads', filePath);
        
        const previewResult = await flatFileService.previewFlatFile(
          fullFilePath,
          { 
            delimiter: delimiter || ',',
            headers: true,
            rows: 100
          }
        );

        if (!previewResult.success) {
          return res.status(400).json(previewResult);
        }

        return res.status(200).json(previewResult);
      }
      else {
        return res.status(400).json({
          success: false,
          message: 'Invalid source type specified'
        });
      }
    } catch (error) {
      console.error('Preview data error:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to preview data: ${error.message}`
      });
    }
  }
}

module.exports = new IngestionController();
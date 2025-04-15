const ClickHouseService = require('../services/ClickHouseService');
const fastcsv = require('fast-csv');

class ClickHouseController {
  async testConnection(req, res) {
    try {
      const { host, port, database, username, password, jwt, secure } = req.body;

      if (!host || !port || !database || !jwt) {
        return res.status(400).json({
          success: false,
          message: 'Missing required connection fields'
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

  async listTables(req, res) {
    try {
      const { host, port, database, username, password, jwt, secure } = req.body;

      if (!host || !port || !database || !jwt) {
        return res.status(400).json({
          success: false,
          message: 'Missing required connection fields'
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

      const tablesResult = await clickhouseService.listTables();
      
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

  async getTableSchema(req, res) {
    try {
      const { host, port, database, username, password, jwt, secure, tableName } = req.body;

      if (!host || !port || !database || !jwt || !tableName) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
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

      const schemaResult = await clickhouseService.getTableSchema(tableName);
      
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

  async executeQuery(req, res) {
    try {
      const { host, port, database, username, password, jwt, secure, query } = req.body;

      if (!host || !port || !database || !jwt || !query) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
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

      const queryResult = await clickhouseService.executeQuery(query);
      
      clickhouseService.disconnect();

      if (!queryResult.success) {
        return res.status(400).json(queryResult);
      }

      return res.status(200).json(queryResult);
    } catch (error) {
      console.error('Execute query error:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to execute query: ${error.message}`
      });
    }
  }

  async previewTableData(req, res) {
    try {
      const { host, port, database, username, password, jwt, secure, tableName, columns, limit } = req.body;

      if (!host || !port || !database || !jwt || !tableName) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
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
        columns || '*',
        limit || 100
      );
      
      clickhouseService.disconnect();

      if (!previewResult.success) {
        return res.status(400).json(previewResult);
      }

      return res.status(200).json(previewResult);
    } catch (error) {
      console.error('Preview data error:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to preview data: ${error.message}`
      });
    }
  }
}

module.exports = new ClickHouseController();
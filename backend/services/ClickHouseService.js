const { createClient } = require('@clickhouse/client');

class ClickHouseService {
  constructor(config) {
    this.client = null;
    this.config = config;
  }

  async connect() {
    try {
      const { host, port, database, username, password, secure } = this.config;
      const protocol = secure ? 'https:' : 'http:';
      
      this.client = createClient({
        host: `${protocol}//${host}:${port}`,
        username: username,
        password: password,
        database: database,
        // JWT token is passed via header in the connect method
        request_timeout: 30000,
      });
      
      // Test connection
      const result = await this.client.query({
        query: 'SELECT 1',
        format: 'JSONEachRow',
      });
      
      const rows = await result.json();
      return { success: true, message: 'Connected to ClickHouse successfully' };
    } catch (error) {
      console.error('ClickHouse connection error:', error);
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }

  async listTables() {
    try {
      const result = await this.client.query({
        query: `SHOW TABLES FROM ${this.config.database}`,
        format: 'JSONEachRow',
      });

      const tables = await result.json();
      return { success: true, data: tables };
    } catch (error) {
      console.error('Error listing tables:', error);
      return { success: false, message: `Failed to list tables: ${error.message}` };
    }
  }

  async getTableSchema(tableName) {
    try {
      const result = await this.client.query({
        query: `DESCRIBE TABLE ${tableName}`,
        format: 'JSONEachRow',
      });

      const columns = await result.json();
      return { success: true, data: columns };
    } catch (error) {
      console.error(`Error getting schema for table ${tableName}:`, error);
      return { success: false, message: `Failed to get schema: ${error.message}` };
    }
  }

  async executeQuery(query) {
    try {
      const result = await this.client.query({
        query,
        format: 'JSONEachRow',
      });

      const data = await result.json();
      return { success: true, data };
    } catch (error) {
      console.error('Query execution error:', error);
      return { success: false, message: `Query failed: ${error.message}` };
    }
  }

  async previewTableData(tableName, columns = '*', limit = 100) {
    try {
      const columnsStr = Array.isArray(columns) ? columns.join(', ') : columns;
      const query = `SELECT ${columnsStr} FROM ${tableName} LIMIT ${limit}`;
      
      const result = await this.client.query({
        query,
        format: 'JSONEachRow',
      });

      const data = await result.json();
      return { success: true, data };
    } catch (error) {
      console.error('Preview data error:', error);
      return { success: false, message: `Preview failed: ${error.message}` };
    }
  }

  async exportToFlatFile(tableName, columns, options = {}) {
    try {
      const columnsStr = columns.join(', ');
      let query = `SELECT ${columnsStr} FROM ${tableName}`;
      
      if (options.conditions) {
        query += ` WHERE ${options.conditions}`;
      }
      
      if (options.limit) {
        query += ` LIMIT ${options.limit}`;
      }
      
      const result = await this.client.query({
        query,
        format: 'JSONEachRow',
      });

      const data = await result.json();
      return { success: true, data, count: data.length };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, message: `Export failed: ${error.message}` };
    }
  }

  async importFromFlatFile(tableName, columns, data) {
    try {
      // Create a temporary table if it doesn't exist
      const schemaResult = await this.getTableSchema(tableName);
      let tableExists = schemaResult.success;
      
      // If table doesn't exist, create it with the provided columns
      if (!tableExists) {
        // This is a simplified approach - in a real application, you'd need to determine data types
        const columnsWithTypes = columns.map(col => `${col} String`).join(', ');
        const createQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsWithTypes}) ENGINE = MergeTree() ORDER BY tuple()`;
        
        const createResult = await this.executeQuery(createQuery);
        if (!createResult.success) {
          return createResult;
        }
      }
      
      // Insert data in batches for efficiency
      const batchSize = 1000;
      let insertedCount = 0;
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        // Prepare values for insert
        const values = batch.map(row => {
          return '(' + columns.map(col => {
            const value = row[col];
            return typeof value === 'string' ? `'${value.replace(/'/g, "\\'")}'` : (value || 'NULL');
          }).join(',') + ')';
        }).join(',');
        
        const insertQuery = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES ${values}`;
        const insertResult = await this.executeQuery(insertQuery);
        
        if (!insertResult.success) {
          return { success: false, message: `Import failed at batch ${i}`, insertedCount };
        }
        
        insertedCount += batch.length;
      }
      
      return { success: true, message: 'Import completed successfully', count: insertedCount };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, message: `Import failed: ${error.message}` };
    }
  }
  
  // Handle join operations
  async executeJoin(tables, joinConditions, selectedColumns, options = {}) {
    try {
      // Build the query
      const mainTable = tables[0];
      let query = `SELECT ${selectedColumns.join(', ')} FROM ${mainTable}`;
      
      // Add joins
      for (let i = 1; i < tables.length; i++) {
        query += ` JOIN ${tables[i]} ON ${joinConditions[i - 1]}`;
      }
      
      // Add conditions if any
      if (options.conditions) {
        query += ` WHERE ${options.conditions}`;
      }
      
      // Add limit if specified
      if (options.limit) {
        query += ` LIMIT ${options.limit}`;
      }
      
      const result = await this.client.query({
        query,
        format: 'JSONEachRow',
      });

      const data = await result.json();
      return { success: true, data, count: data.length };
    } catch (error) {
      console.error('Join operation error:', error);
      return { success: false, message: `Join failed: ${error.message}` };
    }
  }

  disconnect() {
    if (this.client) {
      this.client = null;
    }
    return { success: true, message: 'Disconnected from ClickHouse' };
  }
}

module.exports = ClickHouseService;
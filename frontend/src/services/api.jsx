import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// API service object with all endpoints
const apiService = {
  // ClickHouse Services
  clickhouse: {
    testConnection: (connectionConfig) => {
      return api.post('/clickhouse/test-connection', connectionConfig);
    },
    
    listTables: (connectionConfig) => {
      return api.post('/clickhouse/list-tables', connectionConfig);
    },
    
    getTableSchema: (connectionConfig, tableName) => {
      return api.post('/clickhouse/table-schema', {
        ...connectionConfig,
        tableName
      });
    },
    
    executeQuery: (connectionConfig, query) => {
      return api.post('/clickhouse/execute-query', {
        ...connectionConfig,
        query
      });
    },
    
    previewData: (connectionConfig, tableName, columns, limit = 100) => {
      return api.post('/clickhouse/preview-data', {
        ...connectionConfig,
        tableName,
        columns,
        limit
      });
    },
    
    exportToFlatFile: (connectionConfig, tableName, selectedColumns, outputFileName, delimiter = ',', conditions = null) => {
      return api.post('/clickhouse/export-to-flatfile', {
        ...connectionConfig,
        tableName,
        selectedColumns,
        outputFileName,
        delimiter,
        conditions
      });
    },
    
    importFromFlatFile: (connectionConfig, tableName, selectedColumns, filePath, delimiter = ',') => {
      return api.post('/clickhouse/import-from-flatfile', {
        ...connectionConfig,
        tableName,
        selectedColumns,
        filePath,
        delimiter
      });
    },
    
    exportJoinedTables: (connectionConfig, tables, joinConditions, selectedColumns, outputFileName, delimiter = ',', conditions = null) => {
      return api.post('/clickhouse/export-joined-tables', {
        ...connectionConfig,
        tables,
        joinConditions,
        selectedColumns,
        outputFileName,
        delimiter,
        conditions
      });
    }
  },
  
  // Flat File Services
  flatfile: {
    uploadFile: (file, onUploadProgress) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return api.post('/flatfile/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress
      });
    },
    
    previewFile: (filePath, delimiter = ',', headers = true, rows = 100) => {
      return api.post('/flatfile/preview', {
        filePath,
        delimiter,
        headers,
        rows
      });
    },
    
    listFiles: () => {
      return api.get('/flatfile/list');
    },
    
    deleteFile: (filePath) => {
      return api.post('/flatfile/delete', { filePath });
    },
    
    getDownloadUrl: (filePath) => {
      return `${api.defaults.baseURL}/flatfile/download/${encodeURIComponent(filePath)}`;
    }
  },
  
  // Utility functions
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },
  
  // Response interceptor for error handling
  setupInterceptors: (onUnauthorized) => {
    api.interceptors.response.use(
      response => response.data,
      error => {
        // Handle specific error cases
        if (error.response) {
          // Unauthorized access
          if (error.response.status === 401 && onUnauthorized) {
            onUnauthorized();
          }
          
          // Return error data from API
          return Promise.reject(error.response.data);
        }
        
        // Network errors or other issues
        return Promise.reject({
          success: false,
          message: error.message || 'Network error occurred'
        });
      }
    );
  }
};

export default apiService;
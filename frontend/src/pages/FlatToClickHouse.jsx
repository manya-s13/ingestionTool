import React, { useState, useEffect } from 'react';
import ConnectionForm from '../components/ConnectionForm';
import ColumnSelector from '../components/ColumnSelector';
import DataPreview from '../components/DataPreview';
import api from '../services/api';

function FlatToClickHouse() {
  const [step, setStep] = useState(1);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [fileConfig, setFileConfig] = useState({
    filePath: '',
    delimiter: ',',
    hasHeader: true
  });
  const [fileColumns, setFileColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [targetTable, setTargetTable] = useState('');
  const [tables, setTables] = useState([]);
  const [createNewTable, setCreateNewTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [columnMappings, setColumnMappings] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [filePreview, setFilePreview] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({
    loading: false,
    message: '',
    error: false
  });
  const [status, setStatus] = useState({
    loading: false,
    message: '',
    error: false,
    recordCount: 0
  });

  // Handle successful connection
  const handleConnect = async (info) => {
    setConnectionInfo(info);
    setStep(2);
    
    try {
      // Fetch tables from the connected ClickHouse
      const response = await api.post('/api/clickhouse/list-tables', info);
      
      if (response.data.success) {
        setTables(response.data.data.map(table => table.name));
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file
      uploadFile(formData, file.name);
    }
  };

  // Upload file to server
  const uploadFile = async (formData, fileName) => {
    try {
      setUploadStatus({
        loading: true,
        message: 'Uploading file...',
        error: false
      });
      
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setFileConfig(prev => ({
          ...prev,
          filePath: response.data.filePath || fileName
        }));
        setFileUploaded(true);
        setUploadStatus({
          loading: false,
          message: 'File uploaded successfully',
          error: false
        });
        
        // Fetch file preview and headers
        fetchFilePreview(response.data.filePath, fileConfig.delimiter, fileConfig.hasHeader);
      } else {
        setUploadStatus({
          loading: false,
          message: response.data.message || 'Upload failed',
          error: true
        });
      }
    } catch (error) {
      setUploadStatus({
        loading: false,
        message: error.response?.data?.message || 'Error during upload',
        error: true
      });
    }
  };

  // Fetch file preview
  const fetchFilePreview = async (filePath, delimiter, hasHeader) => {
    try {
      const response = await api.post('/api/file/preview', {
        filePath,
        delimiter,
        hasHeader
      });
      
      if (response.data.success) {
        setFilePreview(response.data.data.rows || []);
        setFileColumns(response.data.data.columns || []);
        setSelectedColumns(response.data.data.columns || []);
        
        // Initialize column mappings
        const initialMappings = response.data.data.columns.map(column => ({
          sourceColumn: column,
          targetColumn: column.toLowerCase().replace(/\s+/g, '_'),
          dataType: 'String'
        }));
        setColumnMappings(initialMappings);
        
        setStep(3);
      }
    } catch (error) {
      console.error('Error fetching file preview:', error);
    }
  };

  // Handle delimiter change
  const handleDelimiterChange = (e) => {
    const newDelimiter = e.target.value;
    setFileConfig(prev => ({
      ...prev,
      delimiter: newDelimiter
    }));
    
    if (fileUploaded) {
      fetchFilePreview(fileConfig.filePath, newDelimiter, fileConfig.hasHeader);
    }
  };

  // Handle header option change
  const handleHeaderOptionChange = (e) => {
    const hasHeader = e.target.checked;
    setFileConfig(prev => ({
      ...prev,
      hasHeader
    }));
    
    if (fileUploaded) {
      fetchFilePreview(fileConfig.filePath, fileConfig.delimiter, hasHeader);
    }
  };

  // Handle target table selection
  const handleTargetTableChange = (e) => {
    setTargetTable(e.target.value);
    if (e.target.value) {
      fetchTableColumns(e.target.value);
    }
  };

  // Fetch columns for selected table
  const fetchTableColumns = async (tableName) => {
    try {
      const response = await api.post('/api/clickhouse/describe-table', {
        ...connectionInfo,
        tableName
      });
      
      if (response.data.success) {
        const tableColumns = response.data.data.map(col => ({
          name: col.name,
          type: col.type
        }));
        
        // Update column mappings with target table columns
        const updatedMappings = fileColumns.map(sourceCol => {
          const matchingCol = tableColumns.find(
            tableCol => tableCol.name.toLowerCase() === sourceCol.toLowerCase().replace(/\s+/g, '_')
          );
          
          return {
            sourceColumn: sourceCol,
            targetColumn: matchingCol ? matchingCol.name : sourceCol.toLowerCase().replace(/\s+/g, '_'),
            dataType: matchingCol ? matchingCol.type : 'String'
          };
        });
        
        setColumnMappings(updatedMappings);
      }
    } catch (error) {
      console.error('Error fetching table columns:', error);
    }
  };

  // Handle new table name change
  const handleNewTableNameChange = (e) => {
    setNewTableName(e.target.value);
  };

  // Handle create table toggle
  const handleCreateTableToggle = () => {
    setCreateNewTable(!createNewTable);
    if (!createNewTable) {
      setTargetTable('');
    }
  };

  // Handle column mapping change
  const handleColumnMappingChange = (index, field, value) => {
    const updatedMappings = [...columnMappings];
    updatedMappings[index] = {
      ...updatedMappings[index],
      [field]: value
    };
    setColumnMappings(updatedMappings);
  };

  // Handle data type change
  const handleDataTypeChange = (index, dataType) => {
    handleColumnMappingChange(index, 'dataType', dataType);
  };

  // Start data import
  const startImport = async () => {
    try {
      setStatus({
        loading: true,
        message: 'Importing data...',
        error: false,
        recordCount: 0
      });
      
      const requestData = {
        ...connectionInfo,
        fileConfig: {
          ...fileConfig
        },
        columnMappings,
        createNewTable,
        targetTable: createNewTable ? newTableName : targetTable
      };
      
      const endpoint = '/api/ingestion/flat-to-clickhouse';
      const response = await api.post(endpoint, requestData);
      
      if (response.data.success) {
        setStatus({
          loading: false,
          message: 'Data imported successfully',
          error: false,
          recordCount: response.data.count || 0
        });
      } else {
        setStatus({
          loading: false,
          message: response.data.message || 'Import failed',
          error: true,
          recordCount: 0
        });
      }
    } catch (error) {
      setStatus({
        loading: false,
        message: error.response?.data?.message || 'Error during import',
        error: true,
        recordCount: 0
      });
    }
  };

  // Reset the form
  const resetForm = () => {
    setStep(1);
    setConnectionInfo(null);
    setFileConfig({
      filePath: '',
      delimiter: ',',
      hasHeader: true
    });
    setFileColumns([]);
    setSelectedColumns([]);
    setTargetTable('');
    setCreateNewTable(false);
    setNewTableName('');
    setColumnMappings([]);
    setFileUploaded(false);
    setFilePreview([]);
    setUploadStatus({
      loading: false,
      message: '',
      error: false
    });
    setStatus({
      loading: false,
      message: '',
      error: false,
      recordCount: 0
    });
  };

  return (
    <div className="flat-to-clickhouse">
      <h2>Flat File to ClickHouse Ingestion</h2>
      
      {step === 1 && (
        <ConnectionForm 
          onConnect={handleConnect} 
          connectionType="clickhouse" 
        />
      )}
      
      {step >= 2 && connectionInfo && (
        <div className="connection-info">
          <div className="info-header">
            <h3>Connected to ClickHouse</h3>
            <button onClick={() => setStep(1)} type="button">Change Connection</button>
          </div>
          <p>Host: {connectionInfo.host}:{connectionInfo.port}</p>
          <p>Database: {connectionInfo.database}</p>
        </div>
      )}
      
      {step >= 2 && (
        <div className="file-upload">
          <h3>Upload Flat File</h3>
          
          <div className="form-group">
            <label htmlFor="file">Select File:</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              disabled={uploadStatus.loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="delimiter">Delimiter:</label>
            <select
              id="delimiter"
              value={fileConfig.delimiter}
              onChange={handleDelimiterChange}
              disabled={!fileUploaded || uploadStatus.loading}
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="|">Pipe (|)</option>
              <option value="\t">Tab</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={fileConfig.hasHeader}
                onChange={handleHeaderOptionChange}
                disabled={!fileUploaded || uploadStatus.loading}
              />
              File has header row
            </label>
          </div>
          
          {uploadStatus.message && (
            <div className={`status-message ${uploadStatus.error ? 'error' : 'success'}`}>
              {uploadStatus.message}
            </div>
          )}
        </div>
      )}
      
      {step >= 3 && fileUploaded && (
        <div className="target-config">
          <h3>Target Configuration</h3>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={createNewTable}
                onChange={handleCreateTableToggle}
              />
              Create new table
            </label>
          </div>
          
          {createNewTable ? (
            <div className="form-group">
              <label htmlFor="newTableName">New Table Name:</label>
              <input
                type="text"
                id="newTableName"
                value={newTableName}
                onChange={handleNewTableNameChange}
                placeholder="Enter new table name"
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="targetTable">Target Table:</label>
              <select
                id="targetTable"
                value={targetTable}
                onChange={handleTargetTableChange}
                required
              >
                <option value="">-- Select a table --</option>
                {tables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>
          )}
          
          {(targetTable || createNewTable) && (
            <div className="column-mappings">
              <h4>Column Mappings</h4>
              <table className="mapping-table">
                <thead>
                  <tr>
                    <th>Source Column</th>
                    <th>Target Column</th>
                    <th>Data Type</th>
                  </tr>
                </thead>
                <tbody>
                  {columnMappings.map((mapping, index) => (
                    <tr key={index}>
                      <td>{mapping.sourceColumn}</td>
                      <td>
                        <input
                          type="text"
                          value={mapping.targetColumn}
                          onChange={(e) => handleColumnMappingChange(index, 'targetColumn', e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          value={mapping.dataType}
                          onChange={(e) => handleDataTypeChange(index, e.target.value)}
                        >
                          <option value="String">String</option>
                          <option value="Int32">Int32</option>
                          <option value="Int64">Int64</option>
                          <option value="Float32">Float32</option>
                          <option value="Float64">Float64</option>
                          <option value="Date">Date</option>
                          <option value="DateTime">DateTime</option>
                          <option value="UInt32">UInt32</option>
                          <option value="UInt64">UInt64</option>
                          <option value="Boolean">Boolean</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <button 
            onClick={startImport} 
            disabled={(!targetTable && !createNewTable) || !fileUploaded || status.loading || (createNewTable && !newTableName)}
            type="button"
            className="start-button"
          >
            {status.loading ? 'Processing...' : 'Start Import'}
          </button>
          
          {status.message && (
            <div className={`status-message ${status.error ? 'error' : 'success'}`}>
              {status.message}
              {status.recordCount > 0 && (
                <p>Records processed: {status.recordCount}</p>
              )}
              {!status.error && status.recordCount > 0 && (
                <button onClick={resetForm} type="button" className="reset-button">
                  Start New Import
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {step >= 3 && fileUploaded && filePreview.length > 0 && (
        <div className="file-preview">
          <h3>File Preview</h3>
          <div className="preview-table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  {fileColumns.map((column, index) => (
                    <th key={index}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filePreview.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {filePreview.length > 5 && <p>Showing first 5 rows of {filePreview.length} total rows</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default FlatToClickHouse;
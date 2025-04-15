import React, { useState } from 'react';
import ConnectionForm from '../components/ConnectionForm';
import ColumnSelector from '../components/ColumnSelector';
import DataPreview from '../components/DataPreview';
import JoinBuilder from '../components/JoinBuilder';
import api from '../services/api';

function ClickHouseToFlat() {
  const [step, setStep] = useState(1);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [outputConfig, setOutputConfig] = useState({
    fileName: '',
    delimiter: ','
  });
  const [joinConfig, setJoinConfig] = useState(null);
  const [useJoin, setUseJoin] = useState(false);
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

  // Handle table selection
  const handleTableSelect = (e) => {
    setSelectedTable(e.target.value);
    setSelectedColumns([]);
  };

  // Handle column selection
  const handleColumnsSelected = (columns) => {
    setSelectedColumns(columns);
    setStep(3);
  };

  // Handle output configuration
  const handleOutputChange = (e) => {
    const { name, value } = e.target;
    setOutputConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle join configuration
  const handleJoinConfigured = (config) => {
    setJoinConfig(config);
    setStep(3);
  };

  // Toggle join mode
  const toggleJoinMode = () => {
    setUseJoin(!useJoin);
    setSelectedTable('');
    setSelectedColumns([]);
    setJoinConfig(null);
  };

  // Start data ingestion
  const startIngestion = async () => {
    try {
      setStatus({
        loading: true,
        message: 'Processing data...',
        error: false,
        recordCount: 0
      });
      
      let endpoint = '/api/ingestion/clickhouse-to-flat';
      let requestData = {
        ...connectionInfo,
        outputFileName: outputConfig.fileName,
        delimiter: outputConfig.delimiter
      };
      
      if (useJoin && joinConfig) {
        endpoint = '/api/ingestion/joined-clickhouse-to-flat';
        requestData = {
          ...requestData,
          tables: joinConfig.tables,
          joinConditions: joinConfig.joinConditions,
          selectedColumns
        };
      } else {
        requestData = {
          ...requestData,
          tableName: selectedTable,
          selectedColumns
        };
      }
      
      const response = await api.post(endpoint, requestData);
      
      if (response.data.success) {
        setStatus({
          loading: false,
          message: 'Data exported successfully',
          error: false,
          recordCount: response.data.count || 0
        });
      } else {
        setStatus({
          loading: false,
          message: response.data.message || 'Export failed',
          error: true,
          recordCount: 0
        });
      }
    } catch (error) {
      setStatus({
        loading: false,
        message: error.response?.data?.message || 'Error during export',
        error: true,
        recordCount: 0
      });
    }
  };

  return (
    <div className="clickhouse-to-flat">
      <h2>ClickHouse to Flat File Ingestion</h2>
      
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
        <div className="source-selection">
          <div className="join-toggle">
            <label>
              <input 
                type="checkbox" 
                checked={useJoin} 
                onChange={toggleJoinMode}
              /> 
              Use Multi-Table Join
            </label>
          </div>
          
          {!useJoin ? (
            <div className="table-selection">
              <h3>Select Table</h3>
              <select 
                value={selectedTable} 
                onChange={handleTableSelect}
              >
                <option value="">-- Select a table --</option>
                {tables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
              
              {selectedTable && (
                <ColumnSelector 
                  connectionInfo={connectionInfo}
                  sourceType="clickhouse"
                  tableName={selectedTable}
                  onColumnsSelected={handleColumnsSelected}
                />
              )}
            </div>
          ) : (
            <JoinBuilder 
              connectionInfo={connectionInfo}
              onJoinConfigured={handleJoinConfigured}
            />
          )}
        </div>
      )}
      
      {step >= 3 && selectedColumns.length > 0 && (
        <div className="output-config">
          <h3>Output Configuration</h3>
          
          <div className="form-group">
            <label htmlFor="fileName">Output File Name:</label>
            <input
              type="text"
              id="fileName"
              name="fileName"
              value={outputConfig.fileName}
              onChange={handleOutputChange}
              placeholder="output.csv"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="delimiter">Delimiter:</label>
            <select
              id="delimiter"
              name="delimiter"
              value={outputConfig.delimiter}
              onChange={handleOutputChange}
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="|">Pipe (|)</option>
              <option value="\t">Tab</option>
            </select>
          </div>
          
          <button 
            onClick={startIngestion} 
            disabled={!outputConfig.fileName || status.loading}
            type="button"
            className="start-button"
          >
            {status.loading ? 'Processing...' : 'Start Export'}
          </button>
          
          {status.message && (
            <div className={`status-message ${status.error ? 'error' : 'success'}`}>
              {status.message}
              {status.recordCount > 0 && (
                <p>Records processed: {status.recordCount}</p>
              )}
            </div>
          )}
        </div>
      )}
      
      {step >= 3 && !useJoin && selectedTable && selectedColumns.length > 0 && (
        <DataPreview 
          connectionInfo={connectionInfo}
          sourceType="clickhouse"
          tableName={selectedTable}
          selectedColumns={selectedColumns}
        />
      )}
      
      {step >= 3 && useJoin && joinConfig && selectedColumns.length > 0 && (
        <div className="join-preview-notice">
          <p>Join preview is not available. Please proceed with export.</p>
        </div>
      )}
    </div>
  );
}

export default ClickHouseToFlat;
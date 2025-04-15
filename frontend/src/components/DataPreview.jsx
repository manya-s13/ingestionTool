import React, { useState, useEffect } from 'react';
import api from '../services/api';

function DataPreview({ 
  connectionInfo, 
  sourceType, 
  tableName, 
  filePath, 
  selectedColumns,
  delimiter = ',' 
}) {
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError('');
      
      let requestData = {
        source: sourceType,
        selectedColumns: selectedColumns.length > 0 ? selectedColumns : undefined
      };
      
      if (sourceType === 'clickhouse') {
        requestData = {
          ...requestData,
          ...connectionInfo,
          tableName
        };
      } else if (sourceType === 'flatfile') {
        requestData = {
          ...requestData,
          filePath,
          delimiter
        };
      }
      
      const response = await api.post('/api/preview-data', requestData);
      
      if (response.data.success) {
        setPreviewData(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to preview data');
      }
      
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Error loading preview');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear preview when source changes
    setPreviewData([]);
    setError('');
    
    // Only load preview if we have necessary data
    const hasRequiredData = (sourceType === 'clickhouse' && tableName && connectionInfo) || 
                           (sourceType === 'flatfile' && filePath);

    if (hasRequiredData && selectedColumns.length > 0) {
      loadPreview();
    }
  }, [sourceType, tableName, filePath, selectedColumns, connectionInfo]);

  if (loading) {
    return <div className="loading">Loading preview data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (previewData.length === 0) {
    return <div className="empty-preview">No preview data available</div>;
  }

  // Get column headers from first row
  const headers = Object.keys(previewData[0] || {});

  return (
    <div className="data-preview">
      <h3>Data Preview</h3>
      <p>Showing first {previewData.length} records</p>
      
      <div className="preview-table-container">
        <table className="preview-table">
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map(header => (
                  <td key={`${rowIndex}-${header}`}>
                    {row[header] !== null && row[header] !== undefined ? String(row[header]) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <button onClick={loadPreview} type="button">
        Refresh Preview
      </button>
    </div>
  );
}

export default DataPreview;
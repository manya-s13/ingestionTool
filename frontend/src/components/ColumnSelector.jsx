// import React, { useState, useEffect } from 'react';
// import api from '../services/api';

// function ColumnSelector({ 
//   connectionInfo, 
//   sourceType, 
//   tableName, 
//   filePath, 
//   onColumnsSelected 
// }) {
//   const [columns, setColumns] = useState([]);
//   const [selectedColumns, setSelectedColumns] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // Fetch columns based on source type
//   useEffect(() => {
//     const fetchColumns = async () => {
//       try {
//         setLoading(true);
//         setError('');
        
//         if (sourceType === 'clickhouse' && tableName) {
//           // Fetch schema from ClickHouse
//           const response = await api.post('/api/clickhouse/table-schema', {
//             ...connectionInfo,
//             tableName
//           });
          
//           if (response.data.success) {
//             // Extract column names from schema
//             const columnNames = response.data.data.map(col => col.name);
//             setColumns(columnNames);
//             setSelectedColumns([]);
//           } else {
//             setError(response.data.message || 'Failed to fetch columns');
//           }
//         } 
//         else if (sourceType === 'flatfile' && filePath) {
//           // Get schema from flat file
//           const response = await api.post('/api/preview-data', {
//             source: 'flatfile',
//             filePath,
//             delimiter: ',', // Default delimiter
//           });
          
//           if (response.data.success && response.data.schema) {
//             setColumns(response.data.schema);
//             setSelectedColumns([]);
//           } else {
//             setError(response.data.message || 'Failed to get file schema');
//           }
//         }
        
//         setLoading(false);
//       } catch (error) {
//         setError(error.response?.data?.message || 'Error fetching columns');
//         setLoading(false);
//       }
//     };

//     if ((sourceType === 'clickhouse' && tableName) || (sourceType === 'flatfile' && filePath)) {
//       fetchColumns();
//     }
//   }, [sourceType, tableName, filePath, connectionInfo]);

//   // Handle column selection
//   const toggleColumnSelection = (column) => {
//     setSelectedColumns(prev => {
//       if (prev.includes(column)) {
//         return prev.filter(col => col !== column);
//       } else {
//         return [...prev, column];
//       }
//     });
//   };

//   // Select all columns
//   const selectAllColumns = () => {
//     setSelectedColumns([...columns]);
//   };

//   // Deselect all columns
//   const deselectAllColumns = () => {
//     setSelectedColumns([]);
//   };

//   // Apply selected columns
//   const applySelection = () => {
//     onColumnsSelected(selectedColumns);
//   };

//   if (loading) {
//     return <div className="loading">Loading columns...</div>;
//   }

//   if (error) {
//     return <div className="error">{error}</div>;
//   }

//   return (
//     <div className="column-selector">
//       <h3>Select Columns</h3>
      
//       <div className="column-selection-actions">
//         <button onClick={selectAllColumns} type="button">Select All</button>
//         <button onClick={deselectAllColumns} type="button">Deselect All</button>
//       </div>
      
//       <div className="columns-list">
//         {columns.length === 0 ? (
//           <p>No columns available</p>
//         ) : (
//           columns.map(column => (
//             <div key={column} className="column-item">
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={selectedColumns.includes(column)}
//                   onChange={() => toggleColumnSelection(column)}
//                 />
//                 {column}
//               </label>
//             </div>
//           ))
//         )}
//       </div>
      
//       <div className="column-selection-footer">
//         <p>{selectedColumns.length} columns selected</p>
//         <button 
//           onClick={applySelection}
//           disabled={selectedColumns.length === 0}
//           type="button"
//         >
//           Apply Selection
//         </button>
//       </div>
//     </div>
//   );
// }

// export default ColumnSelector;

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ColumnSelector = ({ columns, selectedColumns, onSelectionChange, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  
  // Filter columns based on search term
  const filteredColumns = columns.filter(column => 
    column.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle select all toggle
  useEffect(() => {
    if (selectAll) {
      onSelectionChange(columns.map(col => col.name));
    } else if (selectedColumns.length === columns.length) {
      // If all were selected and now selectAll is false, deselect all
      onSelectionChange([]);
    }
  }, [selectAll]);
  
  // Update selectAll state when selectedColumns changes externally
  useEffect(() => {
    setSelectAll(selectedColumns.length === columns.length && columns.length > 0);
  }, [selectedColumns, columns]);
  
  // Handle individual column toggle
  const handleColumnToggle = (columnName) => {
    const isSelected = selectedColumns.includes(columnName);
    let newSelection;
    
    if (isSelected) {
      // Remove from selection
      newSelection = selectedColumns.filter(name => name !== columnName);
    } else {
      // Add to selection
      newSelection = [...selectedColumns, columnName];
    }
    
    onSelectionChange(newSelection);
  };
  
  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-semibold mb-4">Select Columns</h2>
      
      {/* Search and Select All controls */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search columns..."
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || columns.length === 0}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={() => setSelectAll(!selectAll)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading || columns.length === 0}
            />
            <span className="ml-2 text-sm text-gray-700">Select All</span>
          </label>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : columns.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No columns available. Please select a table first.
        </div>
      ) : (
        <>
          {/* Column selection list */}
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
            {filteredColumns.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No columns match your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                {filteredColumns.map((column) => (
                  <div key={column.name} className="flex items-center p-2 border border-gray-100 rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id={`column-${column.name}`}
                      checked={selectedColumns.includes(column.name)}
                      onChange={() => handleColumnToggle(column.name)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`column-${column.name}`} className="ml-2 text-sm truncate">
                      <span className="font-medium">{column.name}</span>
                      <span className="text-xs text-gray-500 ml-1">({column.type})</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Selection count */}
          <div className="mt-2 text-sm text-gray-600">
            Selected {selectedColumns.length} of {columns.length} columns
          </div>
        </>
      )}
    </div>
  );
};

ColumnSelector.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired
    })
  ).isRequired,
  selectedColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

ColumnSelector.defaultProps = {
  loading: false
};

export default ColumnSelector;
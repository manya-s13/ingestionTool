import React, { useState, useEffect } from 'react';
import api from '../services/api';

function JoinBuilder({ connectionInfo, onJoinConfigured }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTables, setSelectedTables] = useState([]);
  const [joinConditions, setJoinConditions] = useState([]);
  const [tableColumns, setTableColumns] = useState({});
  
  // Fetch tables on mount
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await api.post('/api/clickhouse/list-tables', connectionInfo);
        
        if (response.data.success) {
          const tableList = response.data.data.map(table => table.name);
          setTables(tableList);
        } else {
          setError(response.data.message || 'Failed to fetch tables');
        }
        
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching tables');
        setLoading(false);
      }
    };
    
    if (connectionInfo && connectionInfo.host) {
      fetchTables();
    }
  }, [connectionInfo]);
  
  // Fetch columns for a specific table
  const fetchTableColumns = async (tableName) => {
    try {
      const response = await api.post('/api/clickhouse/table-schema', {
        ...connectionInfo,
        tableName
      });
      
      if (response.data.success) {
        const columns = response.data.data.map(col => col.name);
        setTableColumns(prev => ({
          ...prev,
          [tableName]: columns
        }));
        return columns;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching columns for ${tableName}:`, error);
      return [];
    }
  };
  
  // Add table to join
  const addTable = async (tableName) => {
    if (selectedTables.includes(tableName)) return;
    
    const updatedTables = [...selectedTables, tableName];
    setSelectedTables(updatedTables);
    
    // Fetch columns for the new table
    if (!tableColumns[tableName]) {
      await fetchTableColumns(tableName);
    }
    
    // Add empty join condition if this is not the first table
    if (updatedTables.length > 1) {
      setJoinConditions(prev => [...prev, '']);
    }
  };
  
  // Remove table from join
  const removeTable = (index) => {
    if (index === 0) {
      // Can't remove the first table
      return;
    }
    
    const updatedTables = selectedTables.filter((_, i) => i !== index);
    setSelectedTables(updatedTables);
    
    // Remove corresponding join condition
    if (index > 0) {
      setJoinConditions(prev => prev.filter((_, i) => i !== index - 1));
    }
  };
  
  // Update join condition
  const updateJoinCondition = (index, value) => {
    setJoinConditions(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };
  
  // Submit join configuration
  const handleSubmit = () => {
    // Validate that all join conditions are filled
    if (selectedTables.length > 1 && joinConditions.some(cond => !cond)) {
      setError('All join conditions must be specified');
      return;
    }
    
    onJoinConfigured({
      tables: selectedTables,
      joinConditions
    });
  };
  
  if (loading) {
    return <div className="loading">Loading tables...</div>;
  }
  
  return (
    <div className="join-builder">
      <h3>Build Table Join</h3>
      
      {error && <div className="error">{error}</div>}
      
      <div className="selected-tables">
        <h4>Selected Tables</h4>
        {selectedTables.length === 0 ? (
          <p>No tables selected</p>
        ) : (
          <ul className="table-list">
            {selectedTables.map((table, index) => (
              <li key={index}>
                {table}
                {index > 0 && (
                  <button 
                    onClick={() => removeTable(index)}
                    type="button" 
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="table-selector">
        <h4>Add Table</h4>
        <select 
          onChange={(e) => addTable(e.target.value)}
          value=""
        >
          <option value="" disabled>Select a table</option>
          {tables.map(table => (
            <option 
              key={table} 
              value={table}
              disabled={selectedTables.includes(table)}
            >
              {table}
            </option>
          ))}
        </select>
      </div>
      
      {selectedTables.length > 1 && (
        <div className="join-conditions">
          <h4>Join Conditions</h4>
          {joinConditions.map((condition, index) => (
            <div key={index} className="join-condition">
              <p>
                Join <strong>{selectedTables[index]}</strong> with <strong>{selectedTables[index + 1]}</strong> on:
              </p>
              <textarea
                value={condition}
                onChange={(e) => updateJoinCondition(index, e.target.value)}
                placeholder={`${selectedTables[index]}.id = ${selectedTables[index + 1]}.${selectedTables[index]}_id`}
                rows={2}
              />
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={handleSubmit}
        disabled={selectedTables.length === 0}
        type="button"
        className="apply-btn"
      >
        Apply Join Configuration
      </button>
    </div>
  );
}

export default JoinBuilder;
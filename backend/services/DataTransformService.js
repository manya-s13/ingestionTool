class DataTransformService {
    constructor() {}
  
    // Transform data based on mapping rules
    async transformData(data, mappings = {}) {
      try {
        if (!data || !Array.isArray(data) || data.length === 0) {
          return {
            success: false,
            message: 'No data provided for transformation'
          };
        }
  
        // If no mappings provided, return original data
        if (!mappings || Object.keys(mappings).length === 0) {
          return {
            success: true,
            data,
            message: 'No transformations applied'
          };
        }
  
        // Apply transformations
        const transformedData = data.map(row => {
          const newRow = {};
          
          // Apply mappings
          for (const [targetField, sourceField] of Object.entries(mappings)) {
            // Simple field rename
            if (typeof sourceField === 'string') {
              newRow[targetField] = row[sourceField];
            }
            // Function transformation
            else if (typeof sourceField === 'function') {
              newRow[targetField] = sourceField(row);
            }
          }
          
          // Include fields not in mapping
          for (const [field, value] of Object.entries(row)) {
            if (!Object.values(mappings).includes(field)) {
              newRow[field] = value;
            }
          }
          
          return newRow;
        });
  
        return {
          success: true,
          data: transformedData,
          count: transformedData.length,
          message: 'Data transformed successfully'
        };
      } catch (error) {
        console.error('Data transformation error:', error);
        return {
          success: false,
          message: `Data transformation failed: ${error.message}`
        };
      }
    }
  
    // Apply data type conversions
    async applyTypeConversions(data, typeConfig = {}) {
      try {
        if (!data || !Array.isArray(data) || data.length === 0) {
          return {
            success: false,
            message: 'No data provided for type conversion'
          };
        }
  
        // If no type configurations provided, return original data
        if (!typeConfig || Object.keys(typeConfig).length === 0) {
          return {
            success: true,
            data,
            message: 'No type conversions applied'
          };
        }
  
        const convertedData = data.map(row => {
          const newRow = { ...row };
          
          for (const [field, type] of Object.entries(typeConfig)) {
            if (newRow[field] !== undefined) {
              switch(type.toLowerCase()) {
                case 'number':
                case 'float':
                case 'double':
                  newRow[field] = parseFloat(newRow[field]);
                  break;
                case 'integer':
                case 'int':
                  newRow[field] = parseInt(newRow[field], 10);
                  break;
                case 'boolean':
                case 'bool':
                  newRow[field] = !!newRow[field] && 
                    newRow[field] !== 'false' && 
                    newRow[field] !== '0';
                  break;
                case 'string':
                  newRow[field] = String(newRow[field]);
                  break;
                case 'date':
                  newRow[field] = new Date(newRow[field]).toISOString().split('T')[0];
                  break;
                case 'datetime':
                  newRow[field] = new Date(newRow[field]).toISOString();
                  break;
                default:
                  // Keep original value
                  break;
              }
            }
          }
          
          return newRow;
        });
  
        return {
          success: true,
          data: convertedData,
          count: convertedData.length,
          message: 'Type conversions applied successfully'
        };
      } catch (error) {
        console.error('Type conversion error:', error);
        return {
          success: false,
          message: `Type conversion failed: ${error.message}`
        };
      }
    }
  
    // Filter data based on conditions
    async filterData(data, conditions = []) {
      try {
        if (!data || !Array.isArray(data) || data.length === 0) {
          return {
            success: false,
            message: 'No data provided for filtering'
          };
        }
  
        // If no conditions provided, return original data
        if (!conditions || conditions.length === 0) {
          return {
            success: true,
            data,
            message: 'No filters applied'
          };
        }
  
        const filteredData = data.filter(row => {
          // Apply all conditions (AND logic)
          return conditions.every(condition => {
            const { field, operator, value } = condition;
            
            if (!field || !operator) {
              return true; // Skip invalid conditions
            }
            
            switch(operator.toLowerCase()) {
              case 'eq':
              case '=':
              case '==':
              case 'equals':
                return row[field] == value;
              case 'neq':
              case '!=':
              case '<>':
              case 'not equals':
                return row[field] != value;
              case 'gt':
              case '>':
              case 'greater than':
                return row[field] > value;
              case 'gte':
              case '>=':
              case 'greater than or equals':
                return row[field] >= value;
              case 'lt':
              case '<':
              case 'less than':
                return row[field] < value;
              case 'lte':
              case '<=':
              case 'less than or equals':
                return row[field] <= value;
              case 'contains':
                return String(row[field]).includes(value);
              case 'starts with':
                return String(row[field]).startsWith(value);
              case 'ends with':
                return String(row[field]).endsWith(value);
              case 'is null':
                return row[field] === null || row[field] === undefined;
              case 'is not null':
                return row[field] !== null && row[field] !== undefined;
              default:
                return true; // Skip unknown operators
            }
          });
        });
  
        return {
          success: true,
          data: filteredData,
          count: filteredData.length,
          message: 'Data filtered successfully'
        };
      } catch (error) {
        console.error('Data filtering error:', error);
        return {
          success: false,
          message: `Data filtering failed: ${error.message}`
        };
      }
    }
  }
  
  module.exports = new DataTransformService();
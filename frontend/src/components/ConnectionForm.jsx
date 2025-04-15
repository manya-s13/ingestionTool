// import React, { useState } from 'react';
// import api from '../services/api';

// function ConnectionForm({ onConnect, connectionType }) {
//   const [formData, setFormData] = useState({
//     host: '',
//     port: connectionType === 'clickhouse' ? '8123' : '',
//     database: '',
//     username: '',
//     password: '',
//     jwt: '',
//     secure: true
//   });
  
//   const [status, setStatus] = useState({
//     loading: false,
//     message: '',
//     error: false
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     setStatus({
//       loading: true,
//       message: 'Testing connection...',
//       error: false
//     });
    
//     try {
//       // Test connection to ClickHouse
//       const response = await api.post('/api/clickhouse/test-connection', formData);
      
//       if (response.data.success) {
//         setStatus({
//           loading: false,
//           message: 'Connection successful!',
//           error: false
//         });
        
//         // Call the onConnect callback with connection info
//         onConnect(formData);
//       } else {
//         setStatus({
//           loading: false,
//           message: response.data.message || 'Connection failed',
//           error: true
//         });
//       }
//     } catch (error) {
//       setStatus({
//         loading: false,
//         message: error.response?.data?.message || 'Connection failed',
//         error: true
//       });
//     }
//   };

//   return (
//     <div className="connection-form">
//       <h2>ClickHouse Connection</h2>
      
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="host">Host:</label>
//           <input
//             type="text"
//             id="host"
//             name="host"
//             value={formData.host}
//             onChange={handleChange}
//             placeholder="localhost"
//             required
//           />
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="port">Port:</label>
//           <input
//             type="text"
//             id="port"
//             name="port"
//             value={formData.port}
//             onChange={handleChange}
//             placeholder="8123"
//             required
//           />
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="database">Database:</label>
//           <input
//             type="text"
//             id="database"
//             name="database"
//             value={formData.database}
//             onChange={handleChange}
//             placeholder="default"
//             required
//           />
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="username">Username:</label>
//           <input
//             type="text"
//             id="username"
//             name="username"
//             value={formData.username}
//             onChange={handleChange}
//             placeholder="default"
//           />
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="password">Password:</label>
//           <input
//             type="password"
//             id="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             placeholder="password"
//           />
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="jwt">JWT Token:</label>
//           <input
//             type="text"
//             id="jwt"
//             name="jwt"
//             value={formData.jwt}
//             onChange={handleChange}
//             placeholder="JWT token for authentication"
//             required
//           />
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="secure">
//             <input
//               type="checkbox"
//               id="secure"
//               name="secure"
//               checked={formData.secure}
//               onChange={handleChange}
//             />
//             Use Secure Connection (HTTPS)
//           </label>
//         </div>
        
//         <button type="submit" disabled={status.loading}>
//           {status.loading ? 'Connecting...' : 'Connect'}
//         </button>
        
//         {status.message && (
//           <div className={`status-message ${status.error ? 'error' : 'success'}`}>
//             {status.message}
//           </div>
//         )}
//       </form>
//     </div>
//   );
// }

// export default ConnectionForm;

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ConnectionForm = ({ onConnect, initialValues, loading }) => {
  const [connection, setConnection] = useState({
    host: initialValues?.host || 'localhost',
    port: initialValues?.port || '8123',
    database: initialValues?.database || 'default',
    username: initialValues?.username || 'default',
    password: initialValues?.password || '',
    secure: initialValues?.secure || false,
    jwt: initialValues?.jwt || ''
  });
  
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConnection(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!connection.host || !connection.port || !connection.database || !connection.jwt) {
      setError('Host, port, database and JWT token are required');
      return;
    }
    
    // Call the onConnect callback with connection details
    onConnect(connection);
  };
  
  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-semibold mb-4">ClickHouse Connection</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Host */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Host
            </label>
            <input
              type="text"
              name="host"
              value={connection.host}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="localhost"
              required
            />
          </div>
          
          {/* Port */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Port
            </label>
            <input
              type="text"
              name="port"
              value={connection.port}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="8123"
              required
            />
          </div>
          
          {/* Database */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Database
            </label>
            <input
              type="text"
              name="database"
              value={connection.database}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="default"
              required
            />
          </div>
          
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={connection.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="default"
            />
          </div>
          
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={connection.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          
          {/* JWT Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JWT Token
            </label>
            <input
              type="password"
              name="jwt"
              value={connection.jwt}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="JWT auth token"
              required
            />
          </div>
        </div>
        
        {/* Secure Connection */}
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="secure"
              checked={connection.secure}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Use secure connection (HTTPS)</span>
          </label>
        </div>
        
        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing Connection...
              </>
            ) : (
              'Test & Connect'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

ConnectionForm.propTypes = {
  onConnect: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  loading: PropTypes.bool
};

ConnectionForm.defaultProps = {
  initialValues: null,
  loading: false
};

export default ConnectionForm;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import ClickHouseToFlat from './pages/ClickHouseToFlat';
import FlatToClickHouse from './pages/FlatToClickHouse';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>ClickHouse & Flat File Data Ingestion Tool</h1>
          <nav>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              end
            >
              ClickHouse to Flat File
            </NavLink>
            <NavLink 
              to="/flat-to-clickhouse" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Flat File to ClickHouse
            </NavLink>
          </nav>
        </header>
        
        <main className="app-content">
          <Routes>
            <Route path="/" element={<ClickHouseToFlat />} />
            <Route path="/flat-to-clickhouse" element={<FlatToClickHouse />} />
          </Routes>
        </main>
        
        <footer className="app-footer">
          <p>ClickHouse & Flat File Bidirectional Data Ingestion Tool</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
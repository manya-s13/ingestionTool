A full-stack application for bidirectional data transfer between ClickHouse databases and flat files (CSV, TSV, etc.). This tool simplifies data extraction, transformation, and loading tasks when working with ClickHouse.
Features

ClickHouse to Flat File: Export data from ClickHouse tables to flat files
Flat File to ClickHouse: Import data from flat files into ClickHouse tables
Join Operations: Execute and export joined queries across multiple tables
Data Preview: Preview both ClickHouse table data and flat file contents
Schema Management: View and analyze table schemas
Connection Management: Easy connection to different ClickHouse instances
Data Transformation: Basic data transformation capabilities

Prerequisites

Node.js (v14+)
npm or yarn
ClickHouse server (accessible from the application)

Installation

Clone the repository

bashgit clone https://github.com/yourusername/bidirectional-clickhouse-tool.git
cd bidirectional-clickhouse-tool

Install backend dependencies

bashcd backend
npm install

Install frontend dependencies

bashcd ../frontend
npm install

Running the Application

Start the backend server

bashcd backend
npm start

Start the frontend development server

bashcd frontend
npm start

Access the application at http://localhost:3000


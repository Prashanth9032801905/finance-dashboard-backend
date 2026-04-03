#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Health check endpoint monitoring
const healthCheck = async () => {
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'HEALTH_CHECK',
      status: data.success ? 'HEALTHY' : 'UNHEALTHY',
      responseTime: Date.now() - startTime,
      environment: data.environment
    };
    
    console.log(JSON.stringify(logEntry));
    appendToLogFile(logEntry);
    
  } catch (error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'HEALTH_CHECK_ERROR',
      error: error.message,
      status: 'CRITICAL'
    };
    
    console.error(JSON.stringify(logEntry));
    appendToLogFile(logEntry);
  }
};

// Performance metrics collection
const performanceMetrics = async () => {
  try {
    const startTime = Date.now();
    const response = await fetch('http://localhost:5000/api/dashboard/summary');
    const responseTime = Date.now() - startTime;
    
    const metrics = {
      timestamp: new Date().toISOString(),
      type: 'PERFORMANCE_METRICS',
      endpoint: '/api/dashboard/summary',
      responseTime,
      status: response.ok ? 'OK' : 'ERROR',
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
    
    console.log(JSON.stringify(metrics));
    appendToLogFile(metrics);
    
  } catch (error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'PERFORMANCE_ERROR',
      error: error.message,
      status: 'ERROR'
    };
    
    console.error(JSON.stringify(logEntry));
    appendToLogFile(logEntry);
  }
};

// Database connection monitoring
const databaseCheck = async () => {
  try {
    const mongoose = require('mongoose');
    const state = mongoose.connection.readyState;
    
    const dbStatus = {
      timestamp: new Date().toISOString(),
      type: 'DATABASE_CHECK',
      state: state === 1 ? 'CONNECTED' : 'DISCONNECTED',
      host: mongoose.connection.host,
      database: mongoose.connection.name
    };
    
    console.log(JSON.stringify(dbStatus));
    appendToLogFile(dbStatus);
    
  } catch (error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'DATABASE_ERROR',
      error: error.message,
      status: 'CRITICAL'
    };
    
    console.error(JSON.stringify(logEntry));
    appendToLogFile(logEntry);
  }
};

// Log file management
const appendToLogFile = (logEntry) => {
  const logDir = '/var/log/finance-api';
  const logFile = path.join(logDir, 'production.log');
  
  // Create log directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Append to log file
  const logLine = JSON.stringify(logEntry) + '\n';
  fs.appendFileSync(logFile, logLine);
};

// Cleanup old logs (keep last 7 days)
const cleanupLogs = () => {
  try {
    const logDir = '/var/log/finance-api';
    const files = fs.readdirSync(logDir);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    files.forEach(file => {
      const filePath = path.join(logDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < sevenDaysAgo) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old log file: ${file}`);
      }
    });
    
  } catch (error) {
    console.error('Log cleanup error:', error);
  }
};

// Schedule monitoring tasks
console.log('🚀 Production Monitoring Started');

// Health check every minute
cron.schedule('* * * * * *', healthCheck);

// Performance metrics every 5 minutes
cron.schedule('*/5 * * * *', performanceMetrics);

// Database check every 10 minutes
cron.schedule('*/10 * * * *', databaseCheck);

// Log cleanup every day at midnight
cron.schedule('0 0 * * *', cleanupLogs);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Production Monitoring Shutting Down Gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Production Monitoring Terminated');
  process.exit(0);
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

// Import routes
const authRoutes = require('./modules/auth/routes');
const userRoutes = require('./modules/user/routes');
const recordRoutes = require('./modules/record/routes');
const dashboardRoutes = require('./modules/dashboard/routes');
const exportRoutes = require('./modules/export/routes');
const analyticsRoutes = require('./modules/analytics/routes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const performanceMonitor = require('./middleware/performanceMonitor');
const { securityHeaders, authLimiter, generalLimiter, ipWhitelist } = require('./middleware/security');

// Import Swagger documentation
const { specs, swaggerUiOptions } = require('./docs/swagger');

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(ipWhitelist);

// Rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api', generalLimiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:59156',
    'https://finance-dashboard-api.onrender.com',
    'https://*.onrender.com',
    'chrome-error://chromewebdata/',
    'chrome://chromewebdata/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Performance monitoring
app.use(performanceMonitor);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Dashboard Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Finance Dashboard Backend API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard Backend API',
      version: '1.0.0',
      description: 'A comprehensive finance dashboard backend system with authentication, role-based access control, and financial record management. This API provides endpoints for user management, financial record CRUD operations, advanced analytics, and data export capabilities.',
      contact: {
        name: 'API Support',
        email: 'support@finance-dashboard.com',
        url: 'https://finance-dashboard.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.finance-dashboard.com' 
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server' 
          : 'Development server'
      },
      {
        url: 'https://staging-api.finance-dashboard.com',
        description: 'Staging server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token. Obtain this token by logging in via the /api/auth/login endpoint. Example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."'
        }
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { 
              type: 'boolean', 
              description: 'Indicates if the operation was successful',
              example: true 
            },
            message: { 
              type: 'string', 
              description: 'Human-readable message describing the operation result',
              example: 'Operation completed successfully' 
            },
            data: { 
              type: 'object', 
              description: 'Response data payload',
              example: {} 
            },
            timestamp: { 
              type: 'string', 
              format: 'date-time', 
              description: 'ISO timestamp of the response',
              example: '2026-04-03T12:30:00.000Z' 
            }
          },
          required: ['success', 'message']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { 
              type: 'boolean', 
              description: 'Always false for error responses',
              example: false 
            },
            message: { 
              type: 'string', 
              description: 'Error message describing what went wrong',
              example: 'Validation failed' 
            },
            errors: { 
              type: 'array', 
              description: 'Array of validation errors (if applicable)',
              items: { 
                type: 'string',
                example: 'Email is required'
              }
            },
            timestamp: { 
              type: 'string', 
              format: 'date-time', 
              description: 'ISO timestamp of the error',
              example: '2026-04-03T12:30:00.000Z' 
            }
          },
          required: ['success', 'message']
        },
        User: {
          type: 'object',
          properties: {
            _id: { 
              type: 'string', 
              description: 'Unique user identifier',
              example: '60d5ecb74b24a730e3a3e6c7' 
            },
            name: { 
              type: 'string', 
              description: 'User full name',
              example: 'John Doe' 
            },
            email: { 
              type: 'string', 
              format: 'email', 
              description: 'User email address',
              example: 'john.doe@example.com' 
            },
            role: { 
              type: 'string', 
              enum: ['admin', 'analyst', 'viewer'], 
              description: 'User role determining access permissions',
              example: 'admin' 
            },
            status: { 
              type: 'string', 
              enum: ['active', 'inactive'], 
              description: 'Account status',
              example: 'active' 
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time', 
              description: 'Account creation timestamp',
              example: '2026-04-01T10:00:00.000Z' 
            },
            updatedAt: { 
              type: 'string', 
              format: 'date-time', 
              description: 'Last update timestamp',
              example: '2026-04-01T10:00:00.000Z' 
            }
          },
          required: ['_id', 'name', 'email', 'role', 'status']
        },
        Record: {
          type: 'object',
          properties: {
            _id: { 
              type: 'string', 
              description: 'Unique record identifier',
              example: '60d5ecb74b24a730e3a3e6c8' 
            },
            amount: { 
              type: 'number', 
              description: 'Transaction amount (positive for income, negative for expense)',
              example: 5000 
            },
            type: { 
              type: 'string', 
              enum: ['income', 'expense'], 
              description: 'Transaction type',
              example: 'income' 
            },
            category: { 
              type: 'string', 
              description: 'Transaction category for classification',
              example: 'Salary' 
            },
            date: { 
              type: 'string', 
              format: 'date', 
              description: 'Transaction date in ISO format',
              example: '2026-04-01' 
            },
            note: { 
              type: 'string', 
              description: 'Optional notes or description for the transaction',
              example: 'Monthly salary payment' 
            },
            createdBy: { 
              type: 'string', 
              description: 'ID of the user who created this record',
              example: '60d5ecb74b24a730e3a3e6c7' 
            },
            isDeleted: { 
              type: 'boolean', 
              description: 'Soft delete flag',
              example: false 
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time', 
              description: 'Record creation timestamp',
              example: '2026-04-01T10:00:00.000Z' 
            },
            updatedAt: { 
              type: 'string', 
              format: 'date-time', 
              description: 'Last update timestamp',
              example: '2026-04-01T10:00:00.000Z' 
            }
          },
          required: ['amount', 'type', 'category', 'date', 'createdBy']
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: { 
              type: 'integer', 
              description: 'Current page number',
              example: 1 
            },
            totalPages: { 
              type: 'integer', 
              description: 'Total number of pages',
              example: 5 
            },
            totalRecords: { 
              type: 'integer', 
              description: 'Total number of records',
              example: 50 
            },
            limit: { 
              type: 'integer', 
              description: 'Number of records per page',
              example: 10 
            },
            hasNextPage: { 
              type: 'boolean', 
              description: 'Whether there is a next page',
              example: true 
            },
            hasPrevPage: { 
              type: 'boolean', 
              description: 'Whether there is a previous page',
              example: false 
            }
          }
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: { 
              type: 'string', 
              format: 'email', 
              description: 'User email address',
              example: 'admin@finance.com' 
            },
            password: { 
              type: 'string', 
              description: 'User password',
              example: 'admin123' 
            }
          },
          required: ['email', 'password']
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { 
              type: 'boolean', 
              description: 'Indicates if login was successful',
              example: true 
            },
            message: { 
              type: 'string', 
              description: 'Login status message',
              example: 'Login successful' 
            },
            data: { 
              type: 'object', 
              properties: {
                user: { 
                  $ref: '#/components/schemas/User' 
                },
                token: { 
                  type: 'string', 
                  description: 'JWT authentication token',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZDVlY2I3NGIyNGE3MzBlM2EzZTZjNyIsImlhdCI6MTYxNDU2NjQwMCwiZXhwIjoxNjE1MTcxMjAwfQ.signature' 
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints. Use these endpoints to login, register, and manage user sessions.'
      },
      {
        name: 'Users',
        description: 'User management endpoints (Admin only). These endpoints allow administrators to manage user accounts, roles, and permissions.'
      },
      {
        name: 'Records',
        description: 'Financial record management endpoints. Create, read, update, and delete financial transactions with advanced filtering and search capabilities.'
      },
      {
        name: 'Dashboard',
        description: 'Dashboard analytics and reporting endpoints. Access financial summaries, trends, and insights for data-driven decision making.'
      },
      {
        name: 'Export',
        description: 'Data export functionality endpoints. Export financial data in various formats including JSON and CSV with customizable filters.'
      },
      {
        name: 'Analytics',
        description: 'Advanced analytics and insights endpoints. Access detailed financial analysis, trend predictions, and business intelligence.'
      }
    ]
  },
  apis: [
    './src/modules/**/*.js',
    './src/modules/**/*.routes.js'
  ]
};

const specs = swaggerJsdoc(options);

const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .scheme-container { margin: 20px 0 }
  `,
  customSiteTitle: 'Finance Dashboard API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'none',
    tryItOutEnabled: true,
    requestInterceptor: (request) => {
      // Ensure token is properly formatted
      if (request.headers && request.headers.Authorization) {
        const token = request.headers.Authorization;
        if (!token.startsWith('Bearer ')) {
          request.headers.Authorization = `Bearer ${token}`;
        }
      }
      return request;
    }
  }
};

module.exports = {
  specs,
  swaggerUiOptions
};

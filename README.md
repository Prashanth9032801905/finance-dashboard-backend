# Finance Dashboard Backend

A comprehensive, industry-level Finance Dashboard Backend API built with Node.js, Express, and MongoDB. This system provides complete financial record management with authentication, role-based access control, and advanced analytics.

## 🌐 **Live Demo & Documentation**

- **📚 API Documentation**: [Swagger UI](https://finance-dashboard-api.onrender.com/api-docs)
- **🔗 GitHub Repository**: [View on GitHub](https://github.com/YOUR_USERNAME/finance-dashboard-backend)
- **🚀 Live API**: [https://finance-dashboard-api.onrender.com](https://finance-dashboard-api.onrender.com)
- **🏥 Health Check**: [https://finance-dashboard-api.onrender.com/health](https://finance-dashboard-api.onrender.com/health)

## 🚀 Features

### Core Features
- **JWT Authentication** - Secure user authentication with token-based authorization
- **Role-Based Access Control (RBAC)** - Admin, Analyst, and Viewer roles with different permissions
- **Financial Record Management** - Complete CRUD operations with soft delete
- **Advanced Analytics** - MongoDB aggregation pipelines for financial insights
- **Comprehensive Validation** - Joi-based request validation
- **API Documentation** - Swagger UI for interactive API documentation
- **Error Handling** - Global error handling with consistent response format
- **Security** - Helmet, CORS, and other security best practices

### Technical Features
- **Modular Architecture** - Clean separation of concerns with organized folder structure
- **Pagination** - Efficient data pagination for large datasets
- **Filtering & Sorting** - Advanced filtering and sorting capabilities
- **Soft Delete** - Data integrity with soft delete functionality
- **Database Indexing** - Optimized queries with proper indexing
- **Environment Configuration** - Environment-based configuration management
- **Graceful Shutdown** - Proper server shutdown handling
- **Seed Data** - Sample data for testing and development

## 📋 Requirements

- Node.js 16.0 or higher
- MongoDB 4.4 or higher
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-dashboard-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/finance-dashboard

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Database Setup**
   
   Make sure MongoDB is running on your system:
   ```bash
   # Start MongoDB (if installed locally)
   mongod
   ```

5. **Seed Database (Optional)**
   
   Run the seed script to create sample users and financial records:
   ```bash
   npm run seed
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

Once the server is running, visit the following URLs:

- **API Documentation**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`
- **Root Endpoint**: `http://localhost:5000/`

## 👥 User Roles & Permissions

### Admin
- **Full Access**: Complete CRUD operations on all resources
- **User Management**: Create, update, and delete users
- **Financial Records**: Create, read, update, and delete records
- **Analytics**: Access to all dashboard analytics and reports

### Analyst
- **Read Access**: View all financial records and analytics
- **Analytics**: Access to monthly trends, category analysis, and yearly comparisons
- **No Write Access**: Cannot create, update, or delete records or users

### Viewer
- **Read Only**: View financial records and basic summary
- **Limited Analytics**: Access to basic summary and recent transactions
- **No Write Access**: Cannot create, update, or delete records or users

## 🔐 Sample Credentials

After running the seed script, you can use these credentials:

### Admin User
- **Email**: `admin@finance.com`
- **Password**: `admin123`
- **Role**: Admin

### Analyst User
- **Email**: `analyst@finance.com`
- **Password**: `analyst123`
- **Role**: Analyst

### Viewer User
- **Email**: `viewer@finance.com`
- **Password**: `viewer123`
- **Role**: Viewer

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### Users (Admin only)
- `GET /api/users` - Get all users with pagination and filtering
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Financial Records
- `POST /api/records` - Create record (Admin only)
- `GET /api/records` - Get records with pagination and filtering
- `GET /api/records/categories` - Get all unique categories
- `GET /api/records/:id` - Get record by ID
- `PUT /api/records/:id` - Update record (Admin only)
- `DELETE /api/records/:id` - Soft delete record (Admin only)

### Dashboard Analytics
- `GET /api/dashboard/summary` - Get financial summary
- `GET /api/dashboard/monthly` - Get monthly trends (Admin & Analyst)
- `GET /api/dashboard/category` - Get category-wise totals
- `GET /api/dashboard/recent` - Get recent transactions
- `GET /api/dashboard/yearly-comparison` - Get yearly comparison (Admin & Analyst)

## 🏗️ Project Structure

```
finance-dashboard-backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── role.js              # Role-based access control
│   │   ├── validation.js        # Request validation
│   │   └── errorHandler.js       # Global error handling
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── controller.js    # Auth controllers
│   │   │   └── routes.js        # Auth routes
│   │   ├── user/
│   │   │   ├── controller.js    # User controllers
│   │   │   ├── model.js         # User model
│   │   │   └── routes.js        # User routes
│   │   ├── record/
│   │   │   ├── controller.js    # Record controllers
│   │   │   ├── model.js         # Record model
│   │   │   └── routes.js        # Record routes
│   │   └── dashboard/
│   │       ├── controller.js    # Dashboard controllers
│   │       └── routes.js        # Dashboard routes
│   ├── utils/
│   │   └── jwt.js               # JWT utilities
│   ├── validations/
│   │   ├── authValidation.js    # Auth validation schemas
│   │   ├── userValidation.js    # User validation schemas
│   │   └── recordValidation.js  # Record validation schemas
│   ├── docs/
│   │   └── swagger.js           # Swagger configuration
│   └── app.js                   # Express app configuration
├── scripts/
│   └── seed.js                  # Database seed script
├── .env                         # Environment variables
├── .gitignore                   # Git ignore file
├── package.json                 # Project dependencies
├── README.md                    # Project documentation
└── server.js                    # Server entry point
```

## 🔧 Development

### Adding New Endpoints

1. **Create Model**: Define your Mongoose model in the appropriate module
2. **Add Validation**: Create Joi validation schemas
3. **Implement Controller**: Add business logic in controller
4. **Define Routes**: Create routes with appropriate middleware
5. **Update Documentation**: Add Swagger documentation

### Environment Variables

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret key
- `JWT_EXPIRE`: JWT expiration time
- `CORS_ORIGIN`: Allowed CORS origin

## 🧪 Testing

### Manual Testing

1. Start the server: `npm run dev`
2. Visit `http://localhost:5000/api-docs` for interactive API testing
3. Use the sample credentials to test different roles

### Seed Data Testing

Run the seed script to populate the database with sample data:
```bash
npm run seed
```

## 🔒 Security Features

- **Password Hashing**: Bcrypt for secure password storage
- **JWT Authentication**: Token-based authentication
- **Role-Based Access Control**: Granular permission system
- **Input Validation**: Joi validation for all inputs
- **CORS Protection**: Configurable CORS settings
- **Security Headers**: Helmet for security headers
- **Rate Limiting**: Ready for rate limiting implementation
- **Error Sanitization**: Safe error responses

## 📊 Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/analyst/viewer),
  status: String (active/inactive),
  timestamps: true
}
```

### Record Schema
```javascript
{
  amount: Number,
  type: String (income/expense),
  category: String,
  date: Date,
  note: String,
  createdBy: ObjectId (ref: User),
  isDeleted: Boolean (soft delete),
  timestamps: true
}
```

## 🚀 Deployment

### Environment Setup

1. **Set Environment Variables**:
   ```env
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   ```

2. **Build and Deploy**:
   ```bash
   npm install --production
   npm start
   ```

### Docker Support (Optional)

Create a `Dockerfile` for containerized deployment:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api-docs`
- Review the sample data and credentials

## 🎯 Future Enhancements

- [ ] Email notifications
- [ ] Data export functionality
- [ ] Advanced reporting
- [ ] Real-time updates with WebSockets
- [ ] Multi-tenant support
- [ ] Audit logging
- [ ] Data backup and recovery
- [ ] Mobile API optimization
- [ ] GraphQL support
- [ ] Microservices architecture

---

**Built with ❤️ using Node.js, Express, and MongoDB**

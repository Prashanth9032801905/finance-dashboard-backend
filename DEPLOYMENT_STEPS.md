# 🚀 Finance Dashboard Backend - Deployment Steps

## 📋 **GitHub Setup**

### 1. Create GitHub Repository
```bash
# Go to https://github.com/new
# Create repository: finance-dashboard-backend
# Make it PUBLIC
```

### 2. Connect Local Repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/finance-dashboard-backend.git
git branch -M main
git push -u origin main
```

## 📋 **MongoDB Atlas Setup**

### 1. Create Free Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster (M0 Sandbox)
4. Add database user with password
5. Get connection string

### 2. Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/finance-dashboard?retryWrites=true&w=majority
```

## 📋 **Render Deployment**

### 1. Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Create new Web Service

### 2. Deployment Configuration
- **Name**: finance-dashboard-api
- **Region**: Choose nearest region
- **Branch**: main
- **Root Directory**: leave empty
- **Runtime**: Node
- **Build Command**: npm install
- **Start Command**: npm start

### 3. Environment Variables
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-dashboard?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-min-32-characters
JWT_EXPIRE=7d
CORS_ORIGIN=https://finance-dashboard-api.onrender.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📋 **Final Testing**

### 1. Health Check
```bash
curl https://finance-dashboard-api.onrender.com/health
```

### 2. API Documentation
Visit: https://finance-dashboard-api.onrender.com/api-docs

### 3. Test Authentication
```bash
curl -X POST https://finance-dashboard-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finance.com","password":"admin123"}'
```

### 4. Test Protected Endpoint
```bash
# Get token from login response, then:
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://finance-dashboard-api.onrender.com/api/dashboard/summary
```

## 📋 **Expected URLs**

- **API**: https://finance-dashboard-api.onrender.com
- **Documentation**: https://finance-dashboard-api.onrender.com/api-docs
- **Health**: https://finance-dashboard-api.onrender.com/health

## 📋 **Troubleshooting**

### Common Issues
1. **Build Fails**: Check package.json and dependencies
2. **Database Connection**: Verify MongoDB Atlas connection string
3. **CORS Issues**: Check CORS_ORIGIN environment variable
4. **JWT Errors**: Verify JWT_SECRET is set correctly

### Logs
- Check Render dashboard for deployment logs
- Use Render's shell for debugging

## 📋 **Success Indicators**

✅ Health endpoint returns 200
✅ Swagger UI loads without authentication
✅ Login endpoint works
✅ Protected endpoints require JWT
✅ CORS configured for frontend domain

---

**🎉 Your Finance Dashboard Backend is now live!**

# 🚀 Finance Dashboard Backend - Production Deployment Guide

## 🌐 Domain Configuration

### DNS Setup
```bash
# Point your domain to server IP
finance-api.yourdomain.com -> YOUR_SERVER_IP

# Verify DNS propagation
nslookup finance-api.yourdomain.com
dig finance-api.yourdomain.com
```

### Subdomain Configuration
```bash
# API subdomain
api.finance.yourdomain.com -> YOUR_SERVER_IP

# Documentation subdomain
docs.finance.yourdomain.com -> YOUR_SERVER_IP

# Monitoring subdomain
status.finance.yourdomain.com -> YOUR_SERVER_IP
```

## 🛡️ SSL Certificate Setup

### Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d finance-api.yourdomain.com --email admin@yourdomain.com

# Auto-renewal setup
sudo crontab -e "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'systemctl reload nginx'"
```

### Commercial SSL Setup
```bash
# Upload certificates
# Place in /etc/ssl/certs/finance-api/
# private key: finance-api.key
# certificate: finance-api.crt
# CA bundle: finance-api.ca-bundle

# Certificate permissions
sudo chmod 600 /etc/ssl/certs/finance-api/*
sudo chown root:root /etc/ssl/certs/finance-api/*
```

## 🔄 Reverse Proxy Configuration

### Nginx Production Config
```nginx
# /etc/nginx/sites-available/finance-api
server {
    listen 80;
    server_name finance-api.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name finance-api.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/finance-api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/finance-api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Security-Policy "upgrade-insecure-requests";
    
    # Reverse Proxy to Node.js
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS Headers
        proxy_set_header Access-Control-Allow-Origin $http_origin;
        proxy_set_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        proxy_set_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
        proxy_set_header Access-Control-Expose "Content-Length,Content-Range";
        proxy_set_header Access-Control-Allow-Credentials true;
        
        # WebSocket Support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Handle large file uploads
    client_max_body_size 10M;
    
    # Timeout settings
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Logging
    access_log /var/log/nginx/finance-api.access.log combined;
    error_log /var/log/nginx/finance-api.error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript application/rss+xml;
}
```

### Apache Alternative Config
```apache
# /etc/apache2/sites-available/finance-api.conf
<VirtualHost *:80>
    ServerName finance-api.yourdomain.com
    Redirect permanent / https://finance-api.yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName finance-api.yourdomain.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/finance-api.crt
    SSLCertificateKeyFile /etc/ssl/private/finance-api.key
    
    # Proxy Configuration
    ProxyRequests Off
    ProxyPreserveHost On
    ProxyPass / http://localhost:5000
    ProxyPassReverse / http://localhost:5000
    
    # Security Headers
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/finance-api_error.log
    CustomLog ${APACHE_LOG_DIR}/finance-api_access.log combined
</VirtualHost>
```

## 📊 Monitoring Setup

### PM2 Process Manager
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name "finance-api" --env production

# PM2 Configuration File
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'finance-api',
    script: 'server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/finance-api/err.log',
    out_file: '/var/log/finance-api/out.log',
    log_file: '/var/log/finance-api/combined.log',
    time: true
  }]
};

# Start with config
pm2 start ecosystem.config.js
```

### Application Monitoring
```bash
# Start production monitor
node scripts/production-monitor.js &

# Log rotation setup
sudo nano /etc/logrotate.d/finance-api
```

## 🔐 Security Hardening

### Firewall Configuration
```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# IPTables
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT
sudo iptables-save
```

### Production Environment Variables
```bash
# Update production .env
export NODE_ENV=production
export PORT=5000
export MONGODB_URI=mongodb://prod-db-host:27017/finance-prod
export JWT_SECRET=your-super-secure-production-key
export CORS_ORIGIN=https://finance-api.yourdomain.com
export LOG_LEVEL=info
export RATE_LIMIT_WINDOW_MS=900000
export RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Deployment Commands

### Enable and Start Services
```bash
# Enable SSL site (Nginx)
sudo ln -s /etc/nginx/sites-available/finance-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Start with PM2
pm2 start server.js --name "finance-api"

# Monitor logs
pm2 logs finance-api
pm2 monit
```

### Database Migration
```bash
# Backup current data
mongodump --db finance-dashboard --out backup-$(date +%Y%m%d)

# Restore to production
mongorestore --db finance-prod --drop backup-$(date +%Y%m%d)

# Create indexes for production
mongo finance-prod --eval "
db.records.createIndex({date: -1, createdBy: 1});
db.records.createIndex({category: 1});
db.records.createIndex({type: 1});
db.users.createIndex({email: 1}, {unique: true});
"
```

## 📈 Performance Optimization

### Database Optimization
```bash
# Connection pooling
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  bufferCommands: false
});

# Index optimization
db.records.createIndex({date: -1, type: 1, category: 1});
db.records.createIndex({createdBy: 1, date: -1});
```

### Caching Strategy
```bash
# Redis for session caching
npm install redis connect-redis

# API response caching
const redis = require('redis');
const client = redis.createClient();

// Cache expensive queries
const getCachedData = (key, callback) => {
  client.get(key, (err, data) => {
    if (data) return callback(null, JSON.parse(data));
    // Fetch from database and cache result
  });
};
```

## 🛡️ Security Best Practices

### Environment Security
```bash
# Generate secure JWT secret
export JWT_SECRET=$(openssl rand -base64 64)

# Secure MongoDB connection
export MONGODB_URI="mongodb://username:password@prod-db-host:27017/finance-prod?authSource=admin"

# Disable debug in production
export NODE_ENV=production
export DEBUG=*
```

### Security Headers Configuration
```javascript
// Additional security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 📊 Monitoring & Alerting

### Health Check Endpoints
```bash
# Application health
curl -f https://finance-api.yourdomain.com/health

# Database health
curl -f https://finance-api.yourdomain.com/health/db

# Service dependencies
curl -f https://finance-api.yourdomain.com/health/services
```

### Log Management
```bash
# Real-time log monitoring
tail -f /var/log/finance-api/production.log

# Error tracking
grep ERROR /var/log/finance-api/production.log

# Performance analysis
grep "response_time" /var/log/finance-api/production.log
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in /etc/ssl/certs/finance-api.crt -text -noout

# Test SSL configuration
sudo nginx -t
sudo openssl s_client -connect finance-api.yourdomain.com:443
```

#### Database Connection Issues
```bash
# Test MongoDB connection
mongo mongodb://prod-db-host:27017/finance-prod

# Check connection status
mongoose.connection.readyState // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
```

#### Performance Issues
```bash
# Check memory usage
pm2 monit finance-api

# Analyze slow queries
mongoose.set('debug', true)

# Monitor response times
curl -w "@{time_total}\n" -o /dev/null -s https://finance-api.yourdomain.com/api/dashboard/summary
```

## 🎯 Production Deployment Checklist

- [ ] **Domain DNS** configured and propagated
- [ ] **SSL Certificate** installed and valid
- [ ] **Reverse Proxy** configured and tested
- [ ] **Firewall** rules applied
- [ ] **Database** migrated and optimized
- [ ] **Environment** variables set for production
- [ ] **Process Manager** (PM2) configured
- [ ] **Monitoring** system active
- [ ] **Log Rotation** configured
- [ ] **Backup Strategy** implemented
- [ ] **Load Testing** completed
- [ ] **Security Audit** performed
- [ ] **Documentation** updated with production URLs

---

## 🚀 **Ready for Production Deployment!**

Follow this guide step-by-step to deploy your Finance Dashboard Backend to production with enterprise-grade security, monitoring, and performance optimization! 🎯

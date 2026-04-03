const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: windowMs / 1000
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Rate limiters for different endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // max 5 login attempts
  'Too many login attempts, please try again later'
);

const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // max 100 requests
  'Too many requests, please try again later'
);

const uploadLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // max 10 uploads
  'Too many upload attempts, please try again later'
);

const analyticsLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  20, // max 20 analytics requests
  'Too many analytics requests, please try again later'
);

// Security headers configuration
const securityHeaders = helmet({
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
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  ieNoOpen: true,
  referrerPolicy: { policy: 'no-referrer' }
});

// IP whitelist middleware
const ipWhitelist = (req, res, next) => {
  const allowedIPs = [
    '127.0.0.1',
    '::1',
    'localhost'
  ];
  
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  if (process.env.NODE_ENV === 'production' && !allowedIPs.includes(clientIP)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied from this IP address'
    });
  }
  
  next();
};

// Request validation middleware
const validateRequest = (req, res, next) => {
  // Check for common attack patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /onerror\s*=/i,
    /onload\s*=/i
  ];
  
  const url = req.url;
  const userAgent = req.get('User-Agent') || '';
  
  // Check URL for suspicious patterns
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      console.warn(`Suspicious URL pattern detected: ${url} from IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid request detected'
      });
    }
  }
  
  // Check for suspicious user agents
  const suspiciousUserAgents = [
    /sqlmap/i,
    /nmap/i,
    /nikto/i,
    /burp/i,
    /metasploit/i
  ];
  
  for (const pattern of suspiciousUserAgents) {
    if (pattern.test(userAgent)) {
      console.warn(`Suspicious user agent detected: ${userAgent} from IP: ${req.ip}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  }
  
  next();
};

// Request size limiter
const requestSizeLimiter = (req, res, next) => {
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large'
    });
  }
  
  next();
};

module.exports = {
  authLimiter,
  generalLimiter,
  uploadLimiter,
  analyticsLimiter,
  securityHeaders,
  ipWhitelist,
  validateRequest,
  requestSizeLimiter
};

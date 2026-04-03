const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Role-based permission helpers
const permissions = {
  // User management permissions
  canManageUsers: (user) => user.role === 'admin',
  
  // Record permissions
  canCreateRecord: (user) => user.role === 'admin',
  canUpdateRecord: (user) => user.role === 'admin',
  canDeleteRecord: (user) => user.role === 'admin',
  canViewRecords: (user) => ['admin', 'analyst', 'viewer'].includes(user.role),
  
  // Dashboard permissions
  canViewDashboard: (user) => ['admin', 'analyst', 'viewer'].includes(user.role),
  canViewAnalytics: (user) => ['admin', 'analyst'].includes(user.role),
  
  // General permissions
  canViewOwnProfile: (user, targetUserId) => user._id.toString() === targetUserId.toString() || user.role === 'admin'
};

// Custom permission middleware
const checkPermission = (permissionCheck) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const hasPermission = permissionCheck(req.user, req.params.userId || req.user._id);
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

module.exports = {
  authorize,
  permissions,
  checkPermission
};

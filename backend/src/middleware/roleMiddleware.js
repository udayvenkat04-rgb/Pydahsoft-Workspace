const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' }
      });
    }

    if (req.user.role === 'superadmin') {
      return next();
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `User role '${req.user.role}' is not authorized to access this resource`
        }
      });
    }

    next();
  };
};

const authorizePermission = (permissionKey, requireWrite = false) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' }
      });
    }

    if (req.user.role === 'superadmin') {
      return next();
    }

    const perms = req.user.permissions || {};
    const val = perms[permissionKey];

    if (val === 'none' || val === false) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Access denied. Feature '${permissionKey}' is disabled for your account`
        }
      });
    }

    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
    if ((requireWrite || isMutation) && val === 'read') {
      return res.status(403).json({
        success: false,
        error: {
          message: `Read-only access granted for '${permissionKey}'. You do not have write privileges`
        }
      });
    }

    next();
  };
};

module.exports = { authorize, authorizePermission };

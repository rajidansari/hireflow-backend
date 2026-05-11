function checkRole(roles) {
  return function (req, res, next) {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'You are not authorized to perform this action' });
    }
  };
}

export default checkRole;

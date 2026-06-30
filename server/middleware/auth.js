function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) return next();
  const adminPath = req.app.locals.adminPath;
  return res.redirect(`/${adminPath}/login`);
}

function requireGuest(req, res, next) {
  if (req.session && req.session.adminId) {
    const adminPath = req.app.locals.adminPath;
    return res.redirect(`/${adminPath}`);
  }
  next();
}

module.exports = { requireAuth, requireGuest };

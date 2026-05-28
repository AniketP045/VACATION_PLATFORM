const Admin = require('../models/Admin');
module.exports = async function isAdmin(req, res, next) {
  try {
    if (req.session && req.session.adminId) {
      const admin = await Admin.findById(req.session.adminId).select('-password');
      if (admin) { req.admin = admin; 
        return next(); }
    }
    if (req.user && req.user.role && req.user.role === 'admin') {
      req.admin = req.user;
      return next();
    }
    return res.redirect('/admin/login');
  } catch (err) {
    console.error(err);
    return res.redirect('/admin/login');
  }
};
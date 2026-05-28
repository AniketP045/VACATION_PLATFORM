// middleware/isUserBlocked.js
module.exports = function isUserBlocked (req, res, next) {
  if (!req.user) return next(); // guest allowed
  if (req.user.isBlocked) {
    req.flash("error", "Your account is blocked. You cannot perform this action. please contact support.");
    const back = req.get('Referrer') || '/';
    return res.redirect(back);
  }
  return next();
};

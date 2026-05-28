const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const isAdmin = require('../middleware/isAdmin');

const User = require('../models/user');
const Listing = require('../models/Listings');
let Comment;
try { Comment = require('../models/review'); } catch(e){ Comment = null; }

router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});
router.post('/login', async (req, res) => {
  try {
    console.log(">>> ADMIN LOGIN ATTEMPT <<<");
    // trim & normalize
    const rawEmail = (req.body.email || '');
    const email = rawEmail.trim().toLowerCase();
    const password = req.body.password;
    console.log("BODY:", { email: rawEmail, password });

    const admin = await Admin.findOne({ email });
    console.log("FOUND ADMIN:", !!admin, admin ? { email: admin.email, id: admin._id } : null);

    if (!admin) {
      console.log("-> Admin not found for email:", email);
      return res.render('admin/login', { error: 'Invalid credentials' });
    }

    console.log("-> Stored password hash length:", admin.password ? admin.password.length : 'no-pass');
    const ok = await bcrypt.compare(password, admin.password);
    console.log("-> bcrypt.compare result:", ok);

    if (!ok) {
      console.log("-> Password mismatch for admin:", email);
      return res.render('admin/login', { error: 'Invalid credentials' });
    }

    req.session.adminId = admin._id;
    console.log("-> Admin logged in, session.adminId set:", req.session.adminId);
    res.redirect('/admin');
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    res.render('admin/login', { error: 'Error' });
  }
});


router.post('/logout', (req, res) => {
  req.session.destroy(()=> res.redirect('/admin/login'));
});
router.use(isAdmin);
// === Add these in routes/admin.js (below existing imports & before module.exports) ===

/* Show users list (Admin only) */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).lean().sort({ username: 1 });
    return res.render('admin/users', { admin: req.admin, users });
  } catch (e) {
    console.error("Error fetching users list:", e);
    req.flash("error", "Unable to load users");
    return res.redirect('/admin');
  }
});

/* Block user */
router.post('/users/:id/block', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBlocked: true });
    req.flash("success", "User blocked successfully");
    return res.redirect('/admin/users');
  } catch (e) {
    console.error("Error blocking user:", e);
    req.flash("error", "Could not block user");
    return res.redirect('/admin/users');
  }
});

/* Unblock user */
router.post('/users/:id/unblock', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBlocked: false });
    req.flash("success", "User unblocked successfully");
    return res.redirect('/admin/users');
  } catch (e) {
    console.error("Error unblocking user:", e);
    req.flash("error", "Could not unblock user");
    return res.redirect('/admin/users');
  }
});

router.get('/', async (req, res) => {
  const usersCount = await User.countDocuments().catch(()=>0);
  const listingsCount = await Listing.countDocuments().catch(()=>0);
  const pendingCount = await Listing.countDocuments({ status: 'pending' }).catch(()=>0);
  res.render('admin/dashboard', { admin: req.admin, usersCount, listingsCount, pendingCount });
});
router.get('/listings', async (req, res) => {
  const listings = await Listing.find().sort({ createdAt: -1 }).limit(500).lean();
  res.render('admin/listings', { admin: req.admin, listings });
});
router.post('/listings/:id/approve', async (req, res) => {
  await Listing.findByIdAndUpdate(req.params.id, { status: 'active', approvedBy: req.admin._id, approvedAt: new Date() });
  res.redirect('/admin/listings');
});
router.post('/listings/:id/delete', async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.redirect('/admin/listings');
});
router.post('/comments/:id/hide', async (req, res) => {
  if (!Comment) return res.redirect('back');
  await Comment.findByIdAndUpdate(req.params.id, { isHidden: true, removedBy: req.admin._id, removedAt: new Date() });
  res.redirect('back');
});

// === State-wise listings report (for admin) ===
router.get('/reports/state', async (req, res) => {
  try {
    const stateReport = await Listing.aggregate([
      {
        $group: {
          _id: "$state",
          totalListings: { $sum: 1 },

         
          listings: {
            $push: {
              _id: "$_id",
              title: "$title"
            }
          }
        }
      },
      { $sort: { totalListings: -1 } }
    ]);

    res.render('admin/stateReport', { admin: req.admin, stateReport });
  } catch (err) {
    console.error("STATE REPORT ERROR:", err);
    res.redirect('/admin');
  }
});


// Download state-wise report as CSV
router.get('/reports/state/download', async (req, res) => {
  try {
    const stateReport = await Listing.aggregate([
      {
        $group: {
          _id: "$state",
          totalListings: { $sum: 1 }
        }
      },
      { $sort: { totalListings: -1 } }
    ]);

    let csv = "Sr,State,Total Listings\n";
    stateReport.forEach((row, index) => {
      const stateName = row._id || "Not specified";
      csv += `${index + 1},${stateName},${row.totalListings}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="state-report.csv"'
    );

    return res.send(csv);
  } catch (err) {
    console.error("STATE REPORT CSV ERROR:", err);
    res.redirect('/admin/reports/state');
  }
});

module.exports = router;

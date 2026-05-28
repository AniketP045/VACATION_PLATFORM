const Listing = require("./models/Listings");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create a listing!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};
// converts listing[title] → { listing: { title: ... } }
module.exports.nestListingFields = (req, res, next) => {
  if (req.body && req.body.listing) return next();

  const listing = {};
  for (const key of Object.keys(req.body || {})) {
    const m = key.match(/^listing\[(.+)\]$/);
    if (m) listing[m[1]] = req.body[key];
  }

  if (Object.keys(listing).length > 0) {
    req.body.listing = listing;
  }

  next();
};


module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  // use req.user when available; fall back to res.locals.currUser
  const currentUser = req.user || res.locals.currUser;
  if (!currentUser || !listing.owner || !listing.owner._id || !listing.owner._id.equals(currentUser._id)) {
    req.flash("error", "You don't have permission to edit this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    // error.details is an array of objects; each el.message is a string
    const errMsg = error.details.map(el => el.message).join(", ");
    console.log(errMsg);
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    console.log(errMsg);
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }
  const currentUser = req.user || res.locals.currUser;
  if (!currentUser || !review.author || !review.author._id || !review.author._id.equals(currentUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/WrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {validateReview, isLoggedIn, isAuthor} = require("../middleware.js");
const Review = require("../models/review.js");
const Listing = require("../models/Listings.js");
const reviewController = require("../controller/review.js");
const isUserBlocked = require("../middleware/isUserBlocked");

//validate review request


//Reviews post route
router.post("/",isLoggedIn, validateReview,wrapAsync(reviewController.createReview));

//Reviews Delete route

router.delete("/:reviewId",isLoggedIn,isAuthor,wrapAsync(reviewController.deleteReview));
router.post("/", isLoggedIn, isUserBlocked, async (req, res) => {
  // existing review creation logic
});

module.exports = router;
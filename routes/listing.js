const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");
const Listing = require("../models/Listings.js");

// Added nestListingFields import
const { isLoggedIn, isOwner, validateListing, nestListingFields } = require("../middleware.js");
const listingController = require("../controller/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const isUserBlocked = require("../middleware/isUserBlocked");

// NOTE: removed the stray router.post("/") stub that caused request hang

/// Listing route

router
  .route("/")
  .get(wrapAsync(listingController.Index))
  .post(
    isLoggedIn,
    isUserBlocked,
    
    upload.single("listing[image]"),
    nestListingFields, // <<< convert flat listing[...] fields -> req.body.listing
    validateListing,
    wrapAsync(listingController.createListing)
  );

// new route
router.get("/new", isLoggedIn, listingController.createListingForm);

// search route
router.get("/search", wrapAsync(listingController.searchListing));

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  /* update route */
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    nestListingFields, // <<< ensure req.body.listing exists for Joi validation
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  /* delete route */
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// Edit route - DO NOT validate on GET (validate is for incoming body)
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

module.exports = router;

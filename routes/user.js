const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const WrapAsync = require("../utils/WrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controller/users.js");

//signup routes
router.route("/signup").get(userController.getSignUpForm).post(WrapAsync(userController.getSignedUp));

//login routes
router.route("/login").get( userController.getLoginForm).post(saveRedirectUrl,passport.authenticate("local",{ failureRedirect: '/login', failureFlash: true}), userController.getLoggedIn);

//logout route
router.get("/logout", userController.getLoggedOut);

module.exports = router;
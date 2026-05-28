// models/user.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: true,
  }
});

// this will add username, hash, salt fields and helpful methods (register/authenticate)
userSchema.plugin(passportLocalMongoose, { usernameField: 'username' });

module.exports = mongoose.model("User", userSchema);

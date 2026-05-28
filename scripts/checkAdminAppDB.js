

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const MONGO = process.env.ATLASBD_URL || 'mongodb://localhost:27017/listingAppDB';
const NEW_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const NEW_PASS = process.env.SEED_ADMIN_PASSWORD || 'password123';

async function run(){
  try {
    console.log("Connecting to:", MONGO);
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected.");

    const hashed = await bcrypt.hash(NEW_PASS, 10);

    // Try to find admin by email first
    let admin = await Admin.findOne({ email: NEW_EMAIL });
    if(admin){
      admin.password = hashed;
      await admin.save();
      console.log('Updated existing admin ->', NEW_EMAIL);
    } else {
      // if no admin with exact email, check any admin and update/create
      let anyAdmin = await Admin.findOne({});
      if(anyAdmin){
        anyAdmin.email = NEW_EMAIL;
        anyAdmin.password = hashed;
        await anyAdmin.save();
        console.log('Updated first admin with new credentials ->', NEW_EMAIL);
      } else {
        admin = new Admin({ name: 'Site Admin', email: NEW_EMAIL, password: hashed });
        await admin.save();
        console.log('Created admin ->', NEW_EMAIL);
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("ERR:", err);
    process.exit(1);
  }
}

run();

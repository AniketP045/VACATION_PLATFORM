console.log("SEED FILE STARTED");

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admin = require("../models/Admin");

const MONGO = process.env.ATLASBD_URL;

async function seed() {

    await mongoose.connect(MONGO);

    console.log("Mongo Connected");

    const email =
        process.env.SEED_ADMIN_EMAIL;

    const exists =
        await Admin.findOne({ email });

    if (exists) {

        console.log(
            "Admin already exists"
        );

        process.exit(0);
    }

    const hashedPassword =
        await bcrypt.hash(
            process.env
                .SEED_ADMIN_PASSWORD,
            10
        );

    const admin = new Admin({
        name: "Site Admin",

        email:
            process.env
                .SEED_ADMIN_EMAIL,

        password: hashedPassword,
    });

    await admin.save();

    console.log(
        "Admin created successfully"
    );

    process.exit(0);
}

seed().catch((err) => {
    console.log(err);
});
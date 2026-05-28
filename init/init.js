// require('dotenv').config({ path: '../.env' }); // Adjust path if your .env is in the parent folder
// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Lising = require("../models/Listings.js");

// // Use your Atlas URL from environment variables, fallback to local if missing
// const DB_URL = process.env.ATLASBD_URL || "mongodb://127.0.0.1:27017/listingAppDB";

// async function main() {     
//     await mongoose.connect(DB_URL);
//     console.log("Connected to DB successfully");
// }

// const initDB = async () => {
//     try {
//         // 1. Clear existing data
//         await Lising.deleteMany({});
        
//         // 2. Map owner ID to the data objects
//         initData.data = initData.data.map((obj) => ({
//             ...obj, 
//             owner: "668801cfc8bdfafeb48b175c",
//         }));
        
//         // 3. Insert the fresh data
//         await Lising.insertMany(initData.data);
//         console.log("Database initialized successfully!");
//     } catch (error) {
//         console.error("Error initializing data:", error);
//     } finally {
//         // 4. Close connection cleanly so the script stops running on its own
//         mongoose.disconnect();
//         console.log("Disconnected from DB");
//     }
// }

// // CRITICAL FIX: Run the connection FIRST, then initialize the data
// main()
//     .then(() => {
//         return initDB();
//     })
//     .catch(err => {
//         console.log("DB Connection Error:", err);
//     });

require('dotenv').config({ path: '../.env' }); // .env फाईल एका फोल्डर मागे असेल तर
const mongoose = require("mongoose");
const initData = require("./data.js");
const Lising = require("../models/Listings.js");

// const DB_URL = process.env.ATLASBD_URL;
const DB_URL = process.env.ATLASBD_URL;

async function main() {     
    await mongoose.connect(DB_URL);
    console.log("Connected to DB for initialization");
}

const initDB = async () => {
    try {
        await Lising.deleteMany({});

        initData.data = initData.data.map((obj) => ({
            ...obj, 
            owner: "668801cfc8bdfafeb48b175c",
        }));
        
        await Lising.insertMany(initData.data);
        console.log("Database initialized successfully with mock data!");
    } catch (error) {
        console.error("Error initializing data:", error);
    } finally {
        mongoose.disconnect();
        console.log("Disconnected from DB cleanly");
    }
}

main()
    .then(() => {
        return initDB();
    })
    .catch(err => {
        console.log("DB Connection Error:", err);
    });
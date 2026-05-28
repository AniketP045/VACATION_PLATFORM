const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const ListingSchema = new Schema({
    title: { 
        type: String,
        required: true,
    },
    description: String,

    image: {
        url: String,
        filename: String,
    },

    price: Number,

    // State: for admin reports (e.g., Maharashtra, Gujarat)
    state: {
        type: String,
        required: true,
        trim: true,
    },

    location: String,
    country: String,

    // GeoJSON field for map (Point with [lng, lat])
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: [0, 0]     // [lng, lat]
        }
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],

    status: { 
        type: String, 
        enum: ['pending','active','deleted'], 
        default: 'pending' 
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User", 
    },

    // Optional: track admin approval
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin",
    },
    approvedAt: Date,
});

// ⭐ On delete — remove all reviews
ListingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", ListingSchema);

module.exports = Listing;

const Listing = require("../models/Listings");

module.exports.Index = async (req, res) => {
    let allListings = await Listing.find({});
    // MAP: frontend (views/listings/index.ejs) मध्ये allListings मधील
    //      प्रत्येक listing.geometry.coordinates वापरून map वर multiple markers तयार कर.
    res.render("./listings/index.ejs", { allListings });
};

module.exports.createListingForm = (req, res) => {
    // MAP: views/listings/new.ejs मध्ये map picker किंवा lat/lng input fields (hidden or visible)
    //      ठेवून user ला point pick करण्याची सुविधा दे.
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you are accessing is not exist");
        return res.redirect("/listings");
    }
    // MAP: views/listings/show.ejs मध्ये listing.geometry.coordinates वापरून
    //      single marker आणि map center set कर.
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
    let url = req.file ? req.file.path : undefined;
    let filename = req.file ? req.file.filename : undefined;
    let { listing } = req.body;

    // MAP: ensure lat/lng exist and are numbers (form should send listing.lat and listing.lng)
    if (listing && listing.lat && listing.lng) {
        listing.lat = parseFloat(listing.lat);
        listing.lng = parseFloat(listing.lng);
    }

    let newListing = new Listing(listing);
    newListing.owner = req.user._id;

    if (url && filename) {
        newListing.image = { url, filename };
    }

    // MAP: create GeoJSON Point only if lat/lng present
    if (listing && typeof listing.lat === "number" && typeof listing.lng === "number") {
        newListing.geometry = {
            type: "Point",
            coordinates: [listing.lng, listing.lat] // GeoJSON: [lng, lat]
        };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you are accessing is not exist");
        return res.redirect("/listings");
    }
    // MAP: edit.ejs मध्ये listing.geometry.coordinates वापरून map picker मध्ये marker दाखव.
    //      आणि form मध्ये lat, lng hidden/visible fields भरा जे updateListing ला जातील.
    res.render("./listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    // req.body.listing expected to contain fields like title, description, lat, lng, etc.
    let listingData = { ...req.body.listing };

    // MAP: convert lat/lng to numbers if present
    if (listingData && listingData.lat && listingData.lng) {
        listingData.lat = parseFloat(listingData.lat);
        listingData.lng = parseFloat(listingData.lng);
    }

    let listing = await Listing.findByIdAndUpdate(id, { ...listingData }, { new: true });
    console.log(req.body.listing);

    // MAP: if file uploaded, update image
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    // MAP: update geometry if lat & lng provided
    if (listingData && typeof listingData.lat === "number" && typeof listingData.lng === "number") {
        listing.geometry = {
            type: "Point",
            coordinates: [listingData.lng, listingData.lat]
        };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    // MAP: deleting listing removes corresponding marker from frontend once reloaded
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};

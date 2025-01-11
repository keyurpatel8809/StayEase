const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");



const validateListing2 = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });

}));

//Create Route
router.post("/", validateListing2, /* validateListing */ wrapAsync(async (req, res, next) => {
    // if (!req.body.listing) {
    //     throw new ExpressError(400, "Send Valid Data for Listing.")
    // }


    const newListingData = { ...req.body.listing };

    // Ensure image field is an object even if only URL is provided
    if (typeof newListingData.image === 'string') {
        newListingData.image = {
            url: newListingData.image,
            filename: "listingimage" // default filename
        };
    }


    const newListing = new Listing(newListingData);
    await newListing.save();
    req.flash("success", "New Listing created!")
    res.redirect("/listings");
})
);

//Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id", validateListing2, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const updatedData = { ...req.body.listing };

    // If image is provided as a string, convert it to an object
    if (typeof updatedData.image === 'string') {
        updatedData.image = { url: updatedData.image, filename: 'listingimage' };
    }
    await Listing.findByIdAndUpdate(id, updatedData);
    req.flash("success", "Listing Updated!");

    res.redirect(`/listings/${id}`);
}));

//Delete Route 
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));


module.exports = router;
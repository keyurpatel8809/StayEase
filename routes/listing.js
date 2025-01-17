const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");



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
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing, currUser: req.user });

}));

//Create Route
router.post("/", isLoggedIn, validateListing2,  /* validateListing */ wrapAsync(async (req, res, next) => {
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
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing created!")
    res.redirect("/listings");
})
);

//Edit Route
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id", isLoggedIn, validateListing2, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate('owner');
    console.log('Listing:', listing);
    console.log('Listing Owner:', listing?.owner);
    console.log('Current User:', res.locals.currUser);
    console.log(req.user);
    console.log('Current User in Template:', res.locals.currUser);


    if (!listing || !listing.owner) {
        req.flash("error", "Listing not found or missing owner!");
        return res.redirect('/listings');
    }

    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }


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
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));


module.exports = router;
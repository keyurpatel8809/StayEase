const Listing = require("../models/listing");


//Index function to render all the listings
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing, currentUser: req.user });

};

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, filename);
    // const newListingData = { ...req.body.listing };

    // Ensure image field is an object even if only URL is provided
    if (typeof newListingData.image === 'string') {
        newListingData.image = {
            url: newListingData.image,
            filename: "listingimage" // default filename
        };
    }
    // const newListing = new Listing(newListingData);
    // newListing.owner = req.user._id;
    // await newListing.save();
    req.flash("success", "New Listing created!")
    res.redirect("/listings");
};

module.exports.rendereditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    const updatedData = { ...req.body.listing };
    // If image is provided as a string, convert it to an object
    if (typeof updatedData.image === 'string') {
        updatedData.image = { url: updatedData.image, filename: 'listingimage' };
    }

    await Listing.findByIdAndUpdate(id, updatedData);
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
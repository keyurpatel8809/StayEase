const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
    }
    if (error) {
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//Reviews
//Post Review Route
router.post("/", validateReview, wrapAsync(async (req, res, next) => {
    try {
        // console.log(req.params.id);
        let listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).send("Listing not found");
        }
        let newReview = new Review(req.body.review);
        // let { id } = req.params;
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();
        req.flash("success", "New Review created!");

        return res.redirect(`/listings/${listing._id}`);

    } catch (error) {
        if (res.headersSent) {
            return;  // Prevents multiple responses if headers already sent
        }
        next(error);  // Passes the error to Express error handler
    }
})
);

//Delete Review Route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");

    res.redirect(`/listings/${id}`);
}));

module.exports = router;
function validateListing(req, res, next) {
    const { title, description, image, price, country, location } = req.body.listing;
    let errors = [];

    //title validation
    if (!title || title.trim().length > 100) {
        errors.push("Title is required and should under 100 characters.")
    }

    //Description validation
    if (description && description.trim().length > 500) {
        errors.push("Description should not exceed 500 characters.");
    }

    //Image link validation

    // Price validation
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        errors.push("Price is required and should be a positive number.");
    }

    // Country validation (optional, string)
    if (country && !/^[a-zA-Z\s]+$/.test(country)) {
        errors.push("Country should be a valid string. It contains only letter and spaces");
    }

    // Location validation (optional, string)
    if (location && typeof location !== "string") {
        errors.push("Location should be a valid string.");
    }

    // If there are validation errors, return them without proceeding to the route handler
    // if (errors.length > 0) {
    //     return res.status(400).render("error.ejs", { errors }); // Adjust the error view as needed
    // }

    //If there are errors, pass them to global error handler
    if (errors.length > 0) {
        const err = new Error("validation Error");
        err.statusCode = 400;
        err.validationErrors = errors;
        return next(err);
    }

    // If validation passes, proceed to the next middleware/route
    next();

}

module.exports = validateListing;
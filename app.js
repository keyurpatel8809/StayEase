const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const validateListing = require("./utils/listingValidator.js");
const { reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
// Middleware to parse JSON request bodies
app.use(express.json());

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUnintialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.get("/", (req, res) => {
    res.send("Hi! keyur thisside...");
});

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});


//Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = 500 || err.statusCode;
    const errors = err.validationErrors || [err.message || "Something went  wrong! "];
    const message = err.message || "An error occured.";
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { message, errors });

    // console.error("Error details:", err); // Log full error details
    // res.status(500).send("Something went wrong");
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});
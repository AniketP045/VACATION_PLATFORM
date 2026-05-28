if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/reviews.js");
const usersRouter = require("./routes/user.js");
const adminRoutes = require("./routes/admin");

// MongoDB URL
const dbUrl = process.env.ATLASBD_URL;

// Database Connection
async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => {
        console.log("Connected to DB successfully");
    })
    .catch((err) => {
        console.log("DB Connection Error:", err);
    });

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// Mongo Session Store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("Mongo Session Store Error:", err);
});

// Session Config
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Config
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global Variables Middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.currUser = req.user;
    res.locals.user = req.user;

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    next();
});

// Routes
app.get("/home", (req, res) => {
    res.render("home.ejs");
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", usersRouter);
app.use("/admin", adminRoutes);

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

// Demo User Route
app.get("/demouser", async (req, res) => {
    const fakeUser = new User({
        email: "darshankumbhar84@gmail.com",
        username: "darshan@2003",
    });

    const registeredUser = await User.register(
        fakeUser,
        "pratik12345"
    );

    res.send(registeredUser);
});

// Redirect Unknown Routes
app.all("*", (req, res) => {
    res.redirect("/listings");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong!" } = err;

    res.status(statusCode).render("error.ejs", { message });
});

// Server
const port = 3500;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`http://localhost:${port}/home`);
});
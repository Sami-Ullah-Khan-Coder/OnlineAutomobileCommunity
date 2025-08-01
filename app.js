if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const washing = require("./models/washing.js");
const repair = require("./models/repair.js");
const homebuyer = require("./models/homebuyer.js");
const buynow = require("./models/Buynow.js");
const review = require("./models/review.js");
const user = require("./models/user.js");
const admin = require("./models/admin.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const multer = require("multer");
const passport = require("passport");
const Localstrategy = require("passport-local");
const { saveRedirectUrl } = require("../fyp implementation/middleware.js");
const { isLoggedIn } = require("../fyp implementation/middleware.js");
const { adminmiddleware } = require("../fyp implementation/middleware.js");
const { storage } = require("../fyp implementation/cloudConfig.js");
const upload = multer({ storage });



const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("connection successfull")
    })
    .catch((err) => {
        console.log(err);
    });
async function main() {
    await mongoose.connect(dbUrl);
}

app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "homepage")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24 * 3600,
});
store.on("error", ()=>{
    console.log("Error in MONGO SESSION STORE", err);
})

const sessionOption = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};


app.use(session(sessionOption));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());




app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    res.locals.adminuser = req.body.admin;
    res.locals.isvalidpassword = "123456";
    next();
});


// route for Singup
app.get("/signup", (req, res) => {
    res.render("C:/Users/EliteBook/Desktop/fyp implementation/views/signup/signup.ejs");
});
app.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new user({ email, username });
        const registerUser = await user.register(newUser, password);
        req.login(registerUser, (err) => {
            if (err) {
                return next();
            }
            req.flash("success", "You'r Registered Successfully!");
            res.redirect("/home")
        })

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

app.get("/login", (req, res) => {
    res.render("C:/Users/EliteBook/Desktop/fyp implementation/views/signup/login.ejs");
})

app.post("/login", saveRedirectUrl, passport.authenticate("local", {
    failureRedirect: '/login', failureFlash: true,
}),
    async (req, res) => {
        req.flash("success", "welcome back to online automobile community");
        let redirectUrl = req.session.redirectUrl || "/home";
        res.redirect(redirectUrl);
        
    });

app.get("/logout", (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/home");
    });
});

//   route for Admin    

app.get("/loginAdmin", (req, res) => {
    res.render("C:/Users/EliteBook/Desktop/fyp implementation/homepage/loginAdmin.ejs");
})
app.post("/loginAdmin", adminmiddleware, wrapAsync(async (req, res, next) => {
    let newListing = new admin(req.body.admin);
    await newListing.save();
    res.redirect("/home")
}));

// index route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("C:/Users/EliteBook/Desktop/fyp implementation/views/listings/index.ejs", { allListings });
}));
// new route
app.get("/listings/new", isLoggedIn, wrapAsync(async (req, res, next) => {
    res.render("C:/Users/EliteBook/Desktop/fyp implementation/views/listings/new.ejs");
}));
// show routes
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    if (!listing) {
        req.flash("error", "listing you requested to does not exist!");
        res.redirect("/listings")
    } else {
        res.render("C:/Users/EliteBook/Desktop/fyp implementation/views/listings/show.ejs", { listing });
    }

}));

// create route
app.post("/listings", upload.single('listing[image]'), wrapAsync(async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "New Listing Added Successfully")
    res.redirect("/listings");
})
);
// Edit route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    req.flash("success", "Edit listing successfully");
    res.render("listings/edit.ejs", { listing });
}));
// update route
app.put("/listings/:id", upload.single('listing[image]'), wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Update listing successfully");
    res.redirect(`/listings`);
}));
// delete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    req.flash("success", "Deleted listing successfully");
    res.redirect("/listings")
}));





// route for repairing

app.get("/repairing", wrapAsync(async (req, res) => {
    const allListings = await repair.find({}).populate("owner");
    res.render("C:/Users/EliteBook/Desktop/fyp implementation/views/services/Repairing/index.ejs", { allListings });
}));
app.get("/repair", isLoggedIn, wrapAsync(async (req, res) => {
    res.render("C:/Users/EliteBook/Desktop/fyp implementation/views/services/Repairing/new.ejs");
}));

app.post("/repairing", wrapAsync(async (req, res, next) => {
    let newListing = new repair(req.body.repair);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Listing added successfully!");
    res.redirect("/repairing");
})
);
// Edit route
app.get("/repairing/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await repair.findById(id);
    req.flash("success", "Edit listing successfully");
    res.render("C:/Users/EliteBook/Desktop/fyp implementation/views/services/Repairing/edit.ejs", { listing });
}));
// update route
app.put("/repairing/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await repair.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Update listing successfully");
    res.redirect(`/repairing`);
}));
// delete route
app.delete("/repair/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedlisting = await repair.findByIdAndDelete(id);
    req.flash("success", "Deleted listing successfully");
    res.redirect("/repairing")
}));


// route for washing
app.get("/washing", wrapAsync(async (req, res) => {
    const washListings = await washing.find({}).populate("owner");
    res.render("C:/Users/EliteBook/Desktop/fyp implementation/views/services/washing/index.ejs", { washListings });
}));
app.get("/wash", isLoggedIn, (req, res) => {
    res.render("C:/Users/EliteBook/Desktop/fyp implementation/views/services/washing/new.ejs");
});

app.post("/washing", wrapAsync(async (req, res, next) => {
    // let{title, description, image, price, location, country} = req.body;
    let newListing = new washing(req.body.washing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Listing added successfully!");
    res.redirect("/washing");

})
);
// Edit route
app.get("/washing/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await washing.findById(id).populate("owner");
    req.flash("success", "Edit listing successfully");
    res.render("C:/Users/EliteBook/Desktop/fyp implementation/views/services/washing/edit.ejs", { listing });
}));
// update route
app.put("/washing/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await washing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Update listing successfully");
    res.redirect(`/washing`);
}));
// delete route
app.delete("/washing/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedlisting = await washing.findByIdAndDelete(id);
    req.flash("success", "Deleted listing successfully");
    res.redirect("/washing")
}));

// route for frontpage
app.get("/home", (async (req, res) => {
    const reviewss = await review.find({});
    res.render("C:/Users/EliteBook/Desktop/fyp implementation/homepage/index.ejs", { reviewss });
}));

// buyer route for homepage
app.get("/homebuyer", isLoggedIn, (async (req, res) => {
    res.render("C:/Users/EliteBook/Desktop/fyp implementation/homepage/homebuyer.ejs");
}));
app.post("/homebuyer", wrapAsync(async (req, res) => {
    req.flash("success", "Thank you for buying Car!");
    let newListing = new homebuyer(req.body.homebuyer);
    await newListing.save();
    res.redirect("/home");
}));


// buyer route for listing page
app.get("/buynow", isLoggedIn, (async (req, res) => {
    res.render("C:/Users/EliteBook/Desktop/fyp implementation/views/listings/listingbuyer.ejs");
}));
app.post("/listings/:id/buynow", (async (req, res) => {
    req.flash("success", "Thank you for buying Car!");
    let Listings = new buynow(req.body.buynow);
    // Listings.buyer = req.Listing;
    await Listings.save();
    res.redirect("/home");
}));

app.post("/review",isLoggedIn, wrapAsync(async (req, res) => {
    let newreview = new review(req.body.review);
    await newreview.save();
    req.flash("success", "Thank you for giving rating us!");

    res.redirect("/home");
}));


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "page not found!"));
});

app.use((err, req, res, next) => {
    let { statuscode = 500, message = "something went wrong" } = err;
    res.status(statuscode).send(message);
});

//server
app.listen(8080, () => {
    console.log("server is listening at port 8080");
});
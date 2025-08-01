const admin = require("./models/admin");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};
module.exports.adminmiddleware = async (req, res, next) => {

    if (req.body.admin.password == res.locals.isvalidpassword) {
        next();
    } else {
        res.status(400).send(message = "Access denied");
    }
}
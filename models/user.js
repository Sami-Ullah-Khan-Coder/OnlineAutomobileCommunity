const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const { schema } = require("./listing");
const userschema = new Schema({
    email: {
        type: String,
        require: true,
    },
    user_role: {
        type: String,
        default: 'User',
    },

});
userschema.plugin(passportLocalMongoose);
const user = mongoose.model("user", userschema);
module.exports = user;
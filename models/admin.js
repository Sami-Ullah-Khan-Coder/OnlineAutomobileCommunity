const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const adminschema = new Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    user_role: {
        type: String,
        default: 'Admin',
    },

});

const admin = mongoose.model("admin", adminschema);
module.exports = admin;
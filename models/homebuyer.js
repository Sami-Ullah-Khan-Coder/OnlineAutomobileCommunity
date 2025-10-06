const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const homebuyerschema = new Schema({
    name: {
        type: String,
        require: true,
    },
    contact: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,

    },
    location: String,
    country: String,
    // buyer:{
    //         type: Schema.Types.ObjectId,
    //         ref: "buynow",
    // },
});

const frontpage = mongoose.model("homebuyer", homebuyerschema);
module.exports = frontpage;

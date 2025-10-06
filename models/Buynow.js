const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const buyschema = new Schema({
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
    buyer:{
        type: Schema.Types.ObjectId,
        ref: "Listing",
},
});
const buynow = mongoose.model("buynow", buyschema);
module.exports = buynow;
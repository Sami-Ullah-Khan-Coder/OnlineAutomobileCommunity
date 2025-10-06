const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const listingschema = new Schema({
    title: {
        type: String,
        require: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    
});

const Listing = mongoose.model("Listing", listingschema);
module.exports = Listing;

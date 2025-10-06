const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const listingschema = new Schema({
    name: {
        type: String,
        require: true,
    },
    contact: Number,
    address: String,
    location: String,
    country: String,
    status: {
        type: String,
        default: "Processing...",
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
});

const washing = mongoose.model("washing", listingschema);
module.exports = washing;

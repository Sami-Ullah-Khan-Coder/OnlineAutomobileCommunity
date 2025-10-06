const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const reviewschema = new Schema({
    name: {
        type: String,
        require: true,
    },
    review: {
        type: String,
        require: true,
    },
    rating: {
        type: String,
        min: 1,
        max: 5,
    },
});

const review = mongoose.model("review", reviewschema);
module.exports = review;
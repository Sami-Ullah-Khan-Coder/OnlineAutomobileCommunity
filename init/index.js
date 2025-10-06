const mongoose = require("mongoose");
const initData = require("C:\\Users\\EliteBook\\Desktop\\fyp implementation\\init\\data.js");
// const repairdata = require("C:\\Users\\EliteBook\\Desktop\\fyp implementation\\init\\repairdata.js");
const Listing = require("C:\\Users\\EliteBook\\Desktop\\fyp implementation\\models\\listing.js");
// const repair = require("../models/repair");
// const frontpage = require("../models/frontpage");

const mongoose_url ="mongodb://127.0.0.1:27017/Automobile";

main()
.then(()=>{
    console.log("connection successfull")
})
.catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(mongoose_url);
}


const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "67fb35c8bd78339a991e33ce"}));
    await Listing.insertMany(initData.data);
    console.log("data was inilize");
}
initDB();

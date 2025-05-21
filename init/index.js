const mongoose= require("mongoose");
const initData= require("./data.js");
const Listing=require("../models/listing.js");
const mongoUrl='mongodb://127.0.0.1:27017/wanderlust';
main().then(()=>{
console.log("connected to db");
}).catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongoUrl);

}
const initDB= async()=>{
   await Listing.deleteMany({});
   initData.data= initData.data.map((obj)=>({...obj, owner:"67fbe0929b7cf75d81cce038"
   }))
   await Listing.insertMany(initData.data);
   console.log("initialized");
}
initDB();
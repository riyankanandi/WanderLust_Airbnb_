const Listing= require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const wrapAsync=require("../utils/wrapAsync.js");
const mapToken=process.env.Map_Token;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});
module.exports.updateListing=wrapAsync(async(req,res)=>{
    let{id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing}, { new: true });
    if( typeof req.file !=="undefined"){
    let url=req.file.path;
let filename=req.file.filename;
listing.image={url,filename};
await listing.save();
    }
    req.flash("success","Listing Updated");
 res.redirect(`/listings/${id}`);
})
module.exports.index=async (req, res,next) => {
    const allListings = await Listing.find({});  
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};
module.exports.showListing=wrapAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id)
        .populate({path:"reviews",
            populate:{
            path:"author",
            },
        }).populate("owner");
        if (!listing) {
            req.flash("error","Listing you requested for does not exist");
            res.redirect("/listings");
        }
        console.log(listing)
        res.render("listings/show", { listing,mapToken: process.env.MAP_TOKEN } );
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
module.exports.renderEditForm=wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if (!listing) {
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");


    res.render("listings/edit.ejs",{listing,originalImageUrl});
});
module.exports.destroyListing=wrapAsync(async(req,res)=>{
    let {id}=req.params;
   let deletedListing= await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   req.flash("success","Listing Deleted");
  res.redirect("/listings");
});

module.exports.createListing=wrapAsync(async (req, res,next) => {
        
        // const { listing } = req.body; // Extract 'listing' object
        // const newListing = new Listing({
        //     title: listing.title,
        //     description: listing.description,
        //     image: listing.image || {
        //         filename: 'default_filename',
        //         url: 'https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
        //     },
        //     price: Number(listing.price),
        //     location: listing.location,
        //     country: listing.country
        // });
// if(!newListing.description){
//     throw new ExpressError(400,"Description is missing!");
// }
// if(!newListing.title){
//     throw new ExpressError(400,"Title is missing!");
// }
// if(!newListing.description){
//     throw new ExpressError(400," Title is missing!");
// }




        const response = await geocodingClient.forwardGeocode({
          query: req.body.listing.location,
          limit: 1
        }).send();
    
       
      
     
const newListing=new Listing(req.body.listing);
let url=req.file.path;
let filename=req.file.filename;

// console.log(req.user);
newListing.owner=req.user._id;
newListing.geometry=response.body.features[0].geometry;
newListing.image={url,filename};
       let savedListing= await newListing.save();
       console.log(savedListing);
        req.flash("success","New Listing Created");
        res.redirect("/listings");
   
});
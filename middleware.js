const Listing=require("./models/listing.js");
const wrapAsync=require("./utils/wrapAsync.js");
const {listingSchema} =require("./schema.js");
const {reviewSchema} =require("./schema.js");
const Review=require("./models/reviews.js");
const ExpressError = require('./utils/ExpressError'); // No need for the file extension (.js) if it's in the same directory



module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl= req.originalUrl;
        req.flash("error","you must be logged in to create listing"); 
         return res.redirect("/login");
            }
            next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
next();
    };


    module.exports.isOwner=async(req,res,next)=>{
        let{id}=req.params;
        let listing=await Listing.findByIdAndUpdate(id);
        if(!listing.owner._id.equals(res.locals.currUser._id)){
    req.flash("error","Only the owner of the listing can make changes to it");
    return res.redirect(`/listings/${id}`)
        }
        next();
    };


    module.exports.validateListing=(req,res,next)=>{
        let {error} = listingSchema.validate(req.body);
       
        if(error){
            let errMsg=error.details.map((el)=> el.message).join(",");
            throw new ExpressError(400,errMsg);
        }
        else{
            next();
        }
    }
    module.exports.validateReview=(req,res,next)=>{
        let {error} = reviewSchema.validate(req.body);
       
        if(error){
            let errMsg=error.details.map((el)=> el.message).join(",");
            throw new ExpressError(400,errMsg);
        }
        else{
            next();
        }
    }

    module.exports.isReviewAuthor=async(req,res,next)=>{
        let{id,reviewId}=req.params;
        let review=await Review.findById(reviewId);
        if(!review.author._id.equals(res.locals.currUser._id)){
    req.flash("error","Only the owner of the Review can make changes to it");
    return res.redirect(`/listings/${id}`)
        }
        next();
    };
const express=require("express");
const router= express.Router();
const wrapAsync=require("../utils/wrapAsync.js");

const Listing=require("../models/listing.js");
const passport=require("passport");
const localStrategy= require("passport-local");
const flash=require("connect-flash");
const { isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const listingController= require("../controllers/listing.js");
const multer =require("multer");
const {storage}=require("../cloudConfig.js");
// const upload=multer({dest:'uploads/'});
const upload=multer({storage});


//index route
//create route
router
.route("/")
.get( wrapAsync(listingController.index))
 .post(
     isLoggedIn,
     upload.single('listing[image][url]'),
     validateListing,
     listingController.createListing);


//new Route
router.get("/new",isLoggedIn,listingController.renderNewForm);

//update route
//show route 
//DElete route
router.route("/:id")
.put( isLoggedIn, isOwner,upload.single('listing[image][url]'),validateListing,listingController.updateListing,)
.get( listingController.showListing)
.delete(isLoggedIn,isOwner,listingController.destroyListing)

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,listingController.renderEditForm );

module.exports=router;
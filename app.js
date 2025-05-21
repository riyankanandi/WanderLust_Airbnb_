if(process.env.NODE_ENV !="production"){
    require('dotenv').config();
}

console.log(process.env.SECRET);
const express=require("express");
// const expressLayouts = require('express-ejs-layouts');
const app= express();
const path= require("path");
const mongoose=require("mongoose");
const methodOverride= require("method-override");
const ejsMate=require("ejs-mate");
const session= require("express-session");
const MongoStore=require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const localStrategy= require("passport-local");
const User=require("./models/user.js");
const ExpressError=require("./utils/ExpressError.js");
const dbUrl = process.env.ATLASDB_URL;
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({extended:true}));

app.use(methodOverride("_method"));

app.engine("ejs",ejsMate);
// app.use(expressLayouts);
app.set('layout', 'layouts/boilerplate'); 



app.use(express.static(path.join(__dirname,"/public")));





// const mongoUrl='mongodb://127.0.0.1:27017/wanderlust';


main().then(()=>{
console.log("connected to db");
}).catch(err => console.log(err));
async function main() {
await mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // optional but helpful
});

}

// app.get("/testListing", async(req,res)=>{
// let sampleListing= new Listing({
//     title:"My New Villa",
//     description:"By the beach",
//     price: 1200,
//     location: "Calangute,Goa",
//     country:"India",
//     image:""

// });
// await sampleListing.save();
// console.log("Sample was saved");
// res.send("Successful");
// });









// app.post("/listings", async (req,res)=>{
//     // let {title,description, image,price,location, country}=req.body;
// const newListing=new Listing(req.body.listing);
// await newListing.save();
// res.redirect("/listings");

// })

const store= MongoStore.create({
   mongoUrl: dbUrl, 
    crypto:{
        secret: process.env.SECRET,
    
    },
    touchAfter:24*3600,
})
store.on("error",() =>{
    console.log("ERROR IN MONGO SESSION STORE");
})
const sessionOptions ={
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true
    },

}

// app.use((req, res, next) => {
//     res.locals.currUser = req.user || null; // or however you're storing the user
//     next();
//   });
 

  

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success")[0] || null; // flash returns array, take first or null
    res.locals.error = req.flash("error")[0] || null;
    res.locals.currUser = req.user || null;
    console.log("Flash Success:", res.locals.success);
    console.log("Flash Error:", res.locals.error);
  
    next();
});


app.get("/", (req,res)=>{
    // res.send("I am working");
    req.session.test = "Session is working!";
    res.send("Session has been set!");
})


const listingRouter= require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter= require("./routes/user.js");






app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs",{err});
    // res.status(statusCode).send(message);
});
// app.get("/demouser",async(req,res)=>{
//     let fakeUser= new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     })
//    let registeredUser=await User.register(fakeUser,"helloWorld");
//    res.send(registeredUser);
// })

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});
app.listen(8080,()=>{
    console.log("server is listening...");
})
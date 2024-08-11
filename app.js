require("dotenv").config();

const express = require("express");
const app = express();
const axios = require('axios');
const mongoose = require("mongoose");
const path = require("path");
const MongoStore = require("connect-mongo");
const ejsMate = require("ejs-mate")
const userRouter =require("./routes/user.js");
const session = require("express-session");
const flash =require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const twilio = require('twilio');
const wrapAsync=require('./utils/wrapAsync.js');
const ExpressError=require('./utils/ExpressError.js')

const port = process.env.PORT || 3000;

async function main() {
  await mongoose.connect(process.env.DB_URL);
}
main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("unable to connect to database");
  });


const store = MongoStore.create({
    mongoUrl: process.env.DB_URL,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60, //1 day
});

store.on("error",()=>{
    console.log("Error in mongo session store"); 
})

const sessionOptions ={
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
};

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const isLoggedIn= (req,res,next)=>{
    if(!req.isAuthenticated())
    {
    
        req.flash("error" , "you should be logged in!");
        return res.redirect("/user/login");
  }
  next();
}

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})



const accountSid = process.env.SID; 
const authToken = process.env.TOKEN;  

// Create a Twilio client
const client = new twilio(accountSid, authToken);



app.get("/",(req,res)=>{
    res.redirect("/index");
})

app.get("/index",(req,res)=>{
    res.render("./listings/info.ejs");
})

    app.post('/sendSms', (req, res) => {
        console.log("in sending sms post")
        let { phone } = req.body;
        const message = "Your message has been sent to the natural disaster authority. They will contact you shortly.";
        // Sending SMS
        if (!phone.startsWith('+91')) {
            phone = `+91${phone}`;
         }
        client.messages
          .create({
            body: message,      
            from: process.env.NUMBER,
            to: phone,
            
          })
          
          .then((message) => {
            req.flash('success', 'SMS sent successfully!');
            res.redirect('/index');
          })
          .catch((error) => {
            req.flash('error', 'Failed to send SMS: ' + error.message);
            res.redirect('/index');
          });
      });
 
      app.post('/sendSms2',isLoggedIn,(req, res) => {
        console.log("in sending sms post")
        let { phone } = req.body;
        const message = "I wanted to let you know that your report on natural disasters has been sent to the required authority. They will review and verify the information, and it will be added to the list accordingly.";
        // Sending SMS
        if (!phone.startsWith('+91')) {
            phone = `+91${phone}`;
         }
        client.messages
          .create({
            body: message,      
            from: process.env.NUMBER,
            to: phone,
            
          })
          
          .then((message) => {
            req.flash('success', 'SMS sent successfully!');
            res.redirect('/index');
          })
          .catch((error) => {
            req.flash('error', 'Failed to send SMS: ' + error.message);
            res.redirect('/index');
          });
      });
 



app.get('/api/map', async (req, res) => {
    res.render("./listings/map.ejs")
});

app.get('/learn', async (req, res) => {
    res.render("./content/learn.ejs");
});

app.get('/news', async (req, res) => {
    res.render("./content/news.ejs");
});

app.get('/about', async (req, res) => {
    res.render("./content/about.ejs");
});

app.use("/user",userRouter);
app.all('*',(req,res,next)=>{
    res.send("page not found");
});
app.use((err,req,res,next)=>{
    let {statusCode=500,message="async function error"}=err;
    res.status(statusCode).render("./error.ejs",{message});
})
app.listen(port,()=>{
    console.log("server is running on port " + port);
})

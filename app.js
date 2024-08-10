

require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const MongoStore = require("connect-mongo");


const port = 3000;
async function main() {
    await mongoose.connect(process.env.DB_URL);
}
main()
.then(()=>{
    console.log("Connected to MongoDB");
})
.catch((err)=>{
    console.log("unable to connect to database")
})


app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));
app.use(express.json());




app.get("/",(req,res)=>{
    res.send("you are in the root page");
})


app.listen(port,()=>{
    console.log("server is running on port " + port);
})

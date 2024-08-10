

require("dotenv").config();

const express = require("express");
const app = express();
const axios = require('axios');
const mongoose = require("mongoose");
const path = require("path");
const MongoStore = require("connect-mongo");
const maprouter = require("./routes/map.js")

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




app.get('/api/map', async (req, res) => {
     res.render("./map/map.ejs")
  });


app.listen(port,()=>{
    console.log("server is running on port " + port);
})

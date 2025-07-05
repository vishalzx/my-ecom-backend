const mongoose= require("mongoose");
require('dotenv').config();
const mongoURI = process.env.MONGODB_URI;

// Database connection with mongodb
mongoose.connect(mongoURI,{useNewUrlParser: true,
  useUnifiedTopology: true,})
.then(()=>{
    console.log("connection is successful")
}).catch((err)=>{
    console.log(err);
    console.log("No connection");
})
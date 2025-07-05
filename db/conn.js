const mongoose= require("mongoose");


// Database connection with mongodb
mongoose.connect("mongodb+srv://vishalgupta11zx:aarvidb@cluster0.evqqsqa.mongodb.net/e-commerce")
.then(()=>{
    console.log("connection is successful")
}).catch((err)=>{
    console.log(err);
    console.log("No connection");
})
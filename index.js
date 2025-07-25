const port= process.env.PORT || 4000;
require('dotenv').config();

const express= require("express");
require("./db/conn");
const Product= require("./models/products");
const Users= require("./models/users");
const app= express();
const mongoose= require("mongoose");
const jwt= require("jsonwebtoken");
const multer= require("multer");
const path= require("path");
const cors= require("cors");
const Razorpay= require("razorpay");
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');



app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
// Database connection with mongodb
// mongoose.connect("mongodb+srv://vishalgupta11zx:aarvidb@cluster0.evqqsqa.mongodb.net/e-commerce");


app.use(cors({
  origin: ["https://my-ecom-frontend-snowy.vercel.app/", "https://my-ecom-admin-mocha.vercel.app/"],
  credentials: true
}));


// API Creation
app.get("/",(req, res)=>{
    res.send("express app is running");
})

// image storage engine
// const storage= multer.diskStorage({
//     destination: './upload/images',
//     filename: (req, file, cb)=>{
//         return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
//     }
// })

// const upload= multer({storage: storage});

// // Creating Upload Endpoint for images
// app.use('/images', express.static('upload/images'));

// app.post("/upload", upload.single('product'),(req, res)=>{
//     res.json({
//         success: 1,
//         image_url: `http://localhost:${port}/images/${req.file.filename}`
//     })
// })





// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce-products', // optional folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // optional resize
  },
});
const upload = multer({ storage });
// Route to upload image
app.post('/upload', upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
  res.json({
    success: true,
    image_url: req.file.path, // this is the cloudinary URL
  });
});


// const multer = require('multer');
// const path = require('path');

// Set up storage
// const storage = multer.diskStorage({
//   destination: './upload/images',
//   filename: (req, file, cb) => {
//     cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
//   },
// });

// const upload = multer({ storage });

// Serve static files from /upload/images
// app.use('/images', express.static('upload/images'));

// Upload endpoint
// app.post('/upload', upload.single('product'), (req, res) => {
//     console.log(req.get('host'));
//   const fullUrl = `https://my-ecom-backend.onrender.com/images/${req.file.filename}`;
//   res.json({
//     success: 1,
//     image_url: fullUrl,
//   });
// });




// Payment Integration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post("/create-order", async (req, res) => {
  const options = {
    amount: req.body.amount * 100, // amount in smallest currency unit (paise)
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }
});





// Schema for creating products
// const Product= mongoose.model("Product",{
//     id: {
//         type: Number,
//         required: true
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     image: {
//         type: String,
//         required: true
//     },
//     category: {
//         type: String,
//         required: true
//     },
//     new_price: {
//         type: Number,
//         required: true
//     },
//     old_price: {
//         type: Number,
//         require: true
//     },
//     date: {
//         type: Date,
//         default: Date.now
//     },
//     available: {
//         type: Boolean,
//         default: true
//     }

// })

app.post('/addproduct', async (req, res)=>{
    let products= await Product.find({});
    let id;
    if(products.length> 0){
        let last_product_array= products.slice(-1);
        let last_product= last_product_array[0];
        id= last_product.id + 1;
    }
    else{
        id= 1;
    }
    const product= new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success: true,
        name: req.body.name
    })
})

// Creating API for deleting products
app.post('/removeproduct', async (req, res)=>{
    await Product.findOneAndDelete({id: req.body.id});
    console.log('Removed');
    res.json({
        success: true,
        name: req.body.name
    })
})

// Creating API for getting all products
app.get('/allproducts', async (req, res)=>{
    let products= await Product.find({});
    console.log("All products fetched");
    res.send(products);
})

// Schema creating for User model
// const Users= mongoose.model('Users', {
//     name: {
//         type: String,
//     },
//     email: {
//         type: String,
//         unique: true
//     },
//     password: {
//         type: String,
//     },
//     cartData: {
//         type: Object
//     },
//     date: {
//         type: Date,
//         default: Date.now
//     }
// });

// Creating Endpoint for registering the user
app.post('/signup', async(req, res)=>{
    console.log(req.body)
    let check= await Users.findOne({email: req.body.email});
    if(check){
        return res.status(400).json({success: false, errors: "existing user found with same email address"})
    }
    let cart= {};
    for (let index = 0; index < 300; index++) {
        cart[index]= 0;  
    }
    console.log(req.body.email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(req.body.email)) {
        console.log(req.body.email);
        return res.status(400).json({ success: false, errors: "Please enter a valid email address" });
    }    
        const user= new Users({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart
        })

        await user.save();
        res.json({success: true, message: 'User Registered Successfully'});
        const data= {
            user: {
                id: user.id
            }
        }
        const token= jwt.sign(data, 'secret_ecom');
        res.json({success: true, token})
})


// app.post('/signup', async (req, res) => {
//   try {
//     console.log("Incoming signup data:", req.body); // Debug

//     const check = await Users.findOne({ email: req.body.email });
//     if (check) {
//       return res.status(400).json({
//         success: false,
//         errors: "existing user found with same email address"
//       });
//     }

//     let cart = {};
//     for (let i = 0; i < 300; i++) cart[i] = 0;

//     const user = new Users({
//       name: req.body.username,
//       email: req.body.email,
//       password: req.body.password,
//       cartData: cart
//     });

//     await user.save();

//     const data = { user: { id: user.id } };
//     const token = jwt.sign(data, 'secret_ecom');

//     res.json({ success: true, token });
//   } catch (err) {
//     console.error("Signup error:", err); // 🔥 This will show you the real issue
//     res.status(500).json({ success: false, message: 'Server Error', error: err.message });
//   }
// });


// Creating endpoint for user login 
app.post('/login', async(req, res)=>{
    let user= await Users.findOne({email: req.body.email});
    if(user){
        const passCompare= req.body.password=== user.password;
        if(passCompare){
            const data= {
                user: {
                    id: user.id
                }
            }
            const token= jwt.sign(data, 'secret_ecom');
            res.json({success: true, token});
        }
        else{
            res.json({success: false, errors: "wrong password"});
        }
    }
    else{
        res.json({success: false, errors: "wrong email id"});
    }
})


// Creating endpoint for new collection data
app.get('/newcollections',async (req, res)=>{
    let products= await Product.find({});
    let newcollection= products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
})  

// Creating endpoint for popular in women section
app.get('/popularinwomen', async (req, res)=>{
    let products= await Product.find({category:"women"});
    let popular_in_women= products.slice(0,4);
    console.log("Popular in women fetched");
    res.send(popular_in_women);
})

// creating middleware to fetch user
const fetchUser= async (req, res, next)=>{
    const token= req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"please autheticate using valid token"});
    }
    else{
        try {
            const data= jwt.verify(token, 'secret_ecom');
            req.user= data.user;
            next();
        } catch (error) {
            res.status(401).send({errors:"please authenticate using a valid token"});
        }
    }
}

// Creating endpoint for adding products in cartdata
app.post('/addtocart', fetchUser, async (req, res)=>{
    console.log("added", req.body.itemId);
    let userData= await Users.findOne({_id:req.user.id})
    userData.cartData[req.body.itemId]+=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData: userData.cartData});
    res.send("Added");
})

// creating endpoint to remove product from cartdata
app.post('/removefromcart', fetchUser, async (req, res)=>{
    console.log("removed", req.body.itemId);
    let userData= await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]){
        userData.cartData[req.body.itemId]-=1;
    }
    
    await Users.findOneAndUpdate({_id:req.user.id},{cartData: userData.cartData});
    res.send("Removed");
})

// creating endpoint to get cartdata
app.post('/getcart', fetchUser, async (req, res)=>{
    console.log('GetCart');
    let userData= await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})

app.listen(port, (error)=>{
    if(!error){
        console.log(`server running on port ${port}`);
    }
    else{
        console.log("error:"+error);
    }
})
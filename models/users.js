const mongoose= require("mongoose");
const validator= require("validator");

const Users= mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: [true, "Email is already present"],
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email");
            }
        }
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports= Users
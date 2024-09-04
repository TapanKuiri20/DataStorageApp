// const bcrypt = require("bcryptjs/dist/bcrypt");
// const mongoose = require("mongoose");

// const studentSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
   
//     Allfiles: [
//         {
//             fileName: {
//                 type: String,
//                 required: true
//             },
//             data: {
//                 type: Buffer,
//                 required: true
//             },
//             contentType: {
//                 type: String,
//                 required: true
//             },
//             size: { // Add the size field here
//                 type: Number,
//                 required: true
//             }
//         }
//     ]
// });

// studentSchema.pre("save", async function(next){
//     if(this.isModified("password")){
//         // console.log(`the current password: ${this.password}`);
//         this.password = await bcrypt.hash(this.password, 10);
//         // console.log(this.password);

//     }
//     next();
// })

// const Register = mongoose.model("Register", studentSchema);
// module.exports = Register;
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure email uniqueness
        index: true // Indexing email for faster queries
    },
    password: {
        type: String,
        required: true
    },
    Allfiles: [
        {
            fileName: {
                type: String,
                required: true
            },
            data: {
                type: Buffer,
                required: true
            },
            contentType: {
                type: String,
                required: true
            },
            size: {
                type: Number,
                required: true
            }
        }
    ]
});

fileSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const Register = mongoose.model("Register", fileSchema); //Register is collection
module.exports = Register;

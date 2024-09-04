const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const fs = require("fs");
const ejs = require("ejs");
const bcrypt = require("bcryptjs");
const app = express();
const port = process.env.PORT || 3000;
require("./db/conn");
const Register = require("./models/register");
  
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

 // Use sessions to keep track of logged-in users
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,

}));

//set view engine
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

// app.set('views', path.join(__dirname, 'views'));


//use static files
app.use(express.static(path.join(__dirname, "public")));
// const partials_file = path.join(__dirname, "views/partials");
// ejs.registerPartials(partials_file);



// app.get("/", (req, res) => {
//     console.log("home page");
//     // res.render("index");
//     res.render("home");
//  });

app.get("/", (req, res) => {
    const user = req.session.user || null; // Default to null if not logged in
    res.render("home", { user });
});


 app.get("/login",(req,res)=>{
    res.render("login");
 });

app.get("/signup", (req, res) => {
    res.render("signup");
});


 
app.post("/signup", async (req, res) => {
    console.log("register page");
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpass;

        if (password !== cpassword) {
            res.send("Passwords do not match");
            console.log("Passwords do not match");
            return;
        }

        const existingUser = await Register.findOne({ email: req.body.email });
        if (existingUser) {
            res.send("Email already registered");
            console.log("Email already registered");
            return;
        }

        const registerData = new Register({
            name: req.body.name,
            email: req.body.email,
            password: password, // Password hashing is handled in the schema pre-save hook
            Allfiles: [] // Initialize photos as an empty array
        });

        const registered = await registerData.save();
        res.status(201).render("login");
    } catch (err) {
        res.status(400).send(err);
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Register.findOne({ email }).select("password name email");

        if (user && await bcrypt.compare(password, user.password)) {
            // req.session.user = user;
            req.session.user = {
                name: user.name,      
                email: user.email,
                userId: user._id,
                initial: user.name.charAt(0).toUpperCase() // Get the first letter and capitalize
            };
            // const user = req.session.user || null; // Default to null if not logged in
            // res.render("home",{user});
            res.redirect("/");
        } else {
            res.status(400).send("Wrong email or password");
        }
    } catch (err) {
        res.status(400).send("Invalid data");
    }
});

app.get("/logout", async (req, res) => {
    try {
        const user = req.session.user;
        if (user) {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).send('Internal Server Error');
                }
                res.render('home',{user:null}); // Redirect to home or another appropriate page
            });
        } else {
            // Send alert message as JavaScript
            res.send('<script>alert("User Not Logged In"); window.location.href = "/";</script>');
        }
    } catch (err) {
        // Handle any other errors
        res.status(500).send('Internal Server Error');
    }
});




app.get('/deleteAccount', async (req, res) => {
    try {
        const userId = req.session.user.userId; 
        const user = await Register.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Destroy session after deleting account
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Internal Server Error');
            }
            res.render('home', { user: null }); // Redirect to signup or another appropriate page
        });
    } catch (error) {
        res.send('<script>alert("Internal Server Error"); window.location.href = "/";</script>');
    }
});

 




app.get("/upload", async (req, res) => {
    if (req.session.user) {
        try {
            const user = await Register.findOne({ email: req.session.user.email }).lean();
            if (!user) {
                return res.status(404).send("User not found");
            }
            const files = user.Allfiles.map(file => ({
                _id: file._id,
                fileName: file.fileName,
                contentType: file.contentType,
                size: file.size
            }));
            res.render("upload", { userFiles: files ,user: req.session.user});
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
        }
    } else {
        req.session.redirectTo = "/upload";
        res.redirect("/login");
    }
});



app.post("/upload_photo", upload.array("photos", 10), async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).send("User not logged in");
        }

        const files = req.files.map(file => ({
            fileName: file.originalname,
            data: file.buffer,
            contentType: file.mimetype,
            size: file.size 
        }));
            const user = await Register.findOneAndUpdate(
                { email: req.session.user.email },
                { $push: { Allfiles: { $each: files } } },
                { new: true }
            );
        if (user) {
            const  userFiles = user.Allfiles.map(photo => ({
                _id:photo._id,
                fileName: photo.fileName,
                contentType: photo.contentType,
                size: photo.size
            }));
            
            res.render("upload", {
                userFiles: userFiles, user: req.session.user
            });
        } else {
            res.status(404).send("User not found");
        }
    } catch (err) {
        res.status(400).send(err);
    }
});

 
app.get("/view/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`View ID: ${id}`);

        const user = await Register.findOne(
            { "Allfiles._id": id },
            { "Allfiles.$": 1 }
        );

        if (!user || !user.Allfiles.length) {
            console.error(`File not found for ID: ${id}`);
            return res.status(404).send("File not found");
        }

        const onePhoto = user.Allfiles[0];
        res.render("viewOneFile", {
            photoObj: onePhoto
        });

    } catch (error) {
        console.error(`Error fetching file for ID: ${id}`, error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Delete ID: ${id}`);
 
        const user = await Register.findOneAndUpdate(
            { "Allfiles._id": id },
            { $pull: { Allfiles: { _id: id } } },
            { new: true }
        ).lean();

        if (!user) {
            console.error(`User not found for file ID: ${id}`);
            return res.status(404).send("User not found");
        }
 
        res.render("upload", {
            userName: user.name,
            userEmail: user.email,
            userFiles: user.Allfiles,
            user: req.session.user
        });

    } catch (error) {
        console.error(`Error deleting file for ID: ${id}`, error);
        res.status(500).send("Internal Server Error");
    }
});
 
app.get("/download/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error(`Invalid ID: ${id}`);
            return res.status(400).send("Invalid ID");
        }

        const user = await Register.findOne(
            { "Allfiles._id": id },
            { "Allfiles.$": 1 }
        );

        if (!user || user.Allfiles.length === 0) {
            return res.status(404).send("File not found");
        }

        const file = user.Allfiles[0];

        res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
        res.setHeader('Content-Type', file.contentType);
        res.send(file.data);
        
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

 
app.listen(port, () => {
    console.log(`Server is started at port number ${port}`);
});




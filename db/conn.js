 
// const mongoose = require("mongoose");

// mongoose.connect("mongodb://localhost:27017/youtubeRegistration")
// .then(() => {
//     console.log("Connection successful");
// })
// .catch((err) => {
//     console.error("Connection error:", err);
// });

const mongoose = require("mongoose");
// const { MongoClient } = require('mongodb');

// const uri = "mongodb+srv://tapankuiri504:xZxvdVAr4RWPZA05@cluster0.6kgy5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// async function connectToDatabase() {
//     try {
//       // Connect to the MongoDB cluster
//       await client.connect();
      
//       console.log('Connected to MongoDB Atlas!');
  
      
  
//     } catch (error) {
//       console.error('Error connecting to MongoDB Atlas: ', error);
//     } finally {
//       // Close the connection when done
//       await client.close();
//     }
//   }
  
//   connectToDatabase();

const connectDB = async () => {
    // const uri = "mongodb+srv://tapankuiri504:<db_password>@cluster0.6kgy5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    try {
        // await mongoose.connect("mongodb://localhost:27017/AllRegistration"); //AllRegistration is a dataBase
        await mongoose.connect("mongodb+srv://tapankuiri504:uWLRMnYVyfQl9Gg2@cluster0.6kgy5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"); //AllRegistration is a dataBase
        console.log("Connection successful");
    } catch (err) {
        console.error("Connection error:", err);
        //it logs the error and exits the process with a failure code.
        process.exit(1); // Exit process with failure
    }
};
connectDB();
module.exports = connectDB;
// require('dotenv').config({path: './env'})
import dns from 'dns'; // DNS - Domain Name System Jab bhi Node.js kisi website ya MongoDB Atlas se connect karta hai, pehle DNS us domain ka IP address find karta hai.
dns.setServers(['8.8.8.8', '8.8.4.4']);//"Apne default DNS ki jagah Google ke DNS servers use karo."
import dotenv from "dotenv"; //.env file se variables read karna.
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({ path: "./.env" }) //.env file ko load karta hai.

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("ERR:", error);
        throw error;
    })
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port: ${process.env.PORT}`);
  })
})
.catch((err) => {
    console.log("MONGODB connection failed !!!", err)
})
















/*
import express from "express"
const app = express();

// Immediately Invoked Function Expression (IIFE)
;( async () => {
try{
await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
app.on("error", (error) => {
    console.log("ERR", error);
    throw error
})

app.listen(process.env.PORT, () => {
   console.log(`App is listening on port ${process.env.PORT}`)
})
}
catch(error){
    console.log("ERROR: ", error)
    throw error
}
})()
 */
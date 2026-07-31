// require('dotenv').config({path: './env'})
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";

dotenv.config({ path: "./.env" })

connectDB();
















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
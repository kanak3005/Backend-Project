import multer from 'multer';
//Multer frontend se aayi files ko pakadta hai aur unhe tumhare specified location par save karta hai.
// Multer khud Cloudinary par upload nahi kar raha.
// Uska kaam sirf:
// File receive karo
// Local machine par temporary save karo

// Cloudinary ka kaam:
// Local file
//     ↓
// Cloudinary
//     ↓
// Online URL
//

// yahan hum 2 cheezein kr rhe h - 1. File kaha save hogi?(destination)  2. File kis naam se save hogi?(filename)
//diskStorage() ka matlab hai file ko local filesystem par store karna.

const storage = multer.diskStorage({ // yha hum multer ko bol rhe h ki "Uploaded file ko disk (hard disk - computer ka storage (C drive))) me save karna. "
  destination: function (req, file, cb) {  // callback format - cb(error, result)
    cb(null, "./public/temp") // null - error null h, Uploaded file ko ./public/temp folder mein save karo.
  },
  filename: function (req, file, cb) {

    cb(null, file.originalname)
  }
})

export const upload = multer({storage,}) // multer({storage,}) - Multer, tum storage wali configuration use karo.

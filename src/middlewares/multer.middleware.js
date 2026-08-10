import multer from 'multer';

const storage = multer.diskStorage({ // yha hum multer ko bol rhe h ki "Uploaded file ko disk (hard disk - computer ka storage (C drive))) me save karna. "
  destination: function (req, file, cb) {
    cb(null, "./public/temp") // null - error null h, "./public/temp" - ye folder h jaha file save hogi.
  },
  filename: function (req, file, cb) {

    cb(null, file.originalname)
  }
})

export const upload = multer({storage, })

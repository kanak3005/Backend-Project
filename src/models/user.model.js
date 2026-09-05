import mongoose , {Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const userSchema = new Schema (
{ 
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String, 
        required: true,
    }, 
    coverImage: {
        type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId, // ccollect only ids -> ref ? - Ye ObjectId kis collection ki hai? - Video
        ref: 'Video',
      },
    ],
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true
  }
);
 userSchema.pre("save", async function () {

    if (!this.isModified("password")) { // agar password change nhi hua toh yhi se return kr denge - Password ko again hash nahi karenge.
        return;
    }
   // agar password change hua toh password ko hash karenge
    this.password = await bcrypt.hash(this.password, 10);
});
// ye check karega ki entered password stored hash ke corresponding hai ya nahi. isko hum login / change password ke time use karenge.
userSchema.methods.isPasswordCorrect = async function (password) { 
  // bcrypt internally check karega ki entered password stored hash ke corresponding hai ya nahi.
  return await bcrypt.compare(password, this.password)
}

    userSchema.methods.generateAccessToken = function(){
     return jwt.sign({
      _id: this._id,
      username: this.username,
      email: this.email,
      fullname: this.fullname,  
     }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
     })
    }
    userSchema.methods.generateRefreshToken = function(){ // refresh token ka purpose sirf naya access token bnana h for long time, access token ka expiry time chota hota h, refresh token ka expiry time lamba hota h, refresh token ko database me store krte h, access token ko store nahi krte h, 
    // noramlly refresh token valid for 7d,15d,30d tak valid hote h
      return jwt.sign({
      _id: this._id, 
     }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
     })
    }
export const User = mongoose.model('User', userSchema); // yha model create hua

    



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
    userSchema.pre('save', async function(next){
      if(!this.isModified('password')){ // this -> current user , isModified -> check Kya ye field change hui hai?, ye check krega ki password field change hui hai ya nahi, agar change nahi hui to next() call hoga aur save ho jayega, agar change hui to password ko hash krega
       return next();
      }
      this.password = await bcrypt.hash(this.password,10)
      next()
    })
    userSchema.methods.isPasswordCorrect = async function(password) {
      return await bcrypt.compare(password, this.password);
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
     }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
     })
    }
export const User = mongoose.model('User', userSchema); // yha model create hua

    



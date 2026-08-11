import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js"
import {User} from"../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { upload } from '../middlewares/multer.middleware.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
   // get user details from frontend
   // validation ( username shi h ya nhi , email format theek h ya nhi , ye kch empty toh nhi hai)
   // check if user  is already exist check - uername, email
   // check for images ,check for avatar
  // if available images / avatar - upload them to cloudinary, avatar
  // create new object - create entry in DB
  // remove password & refresh token field from response
  // check for user creation 
  // return response 


   // get user details from frontend
const {fullname, email, username, password} = req.body // req.body - ssara data aa jaata ye express provide krta h
console.log("email: ", email);


// validation - kch empty toh nhi hai ? instead of ek - ek field check krte humne ek sath check krlia
// if(fullname === ""){
//   throw new ApiError(400, "fullname is required")
// }
if(
  [fullname,email,username, password].some((field) => 
  field?.trim() === "") // if koi field empty h toh return true
){
 throw new ApiError(400, "All fields is required")
}


// check if user  is already exist check - uername, email
const existedUser = User.findOne({
  $or: [{ username }, { email }]
})

if(existedUser){
  throw new ApiError(409, "User with email or username already exist")
}
console.log(existedUser);

// check for images ,check for avatar
 // multer = req.files ka access de deta hai
 const avatarLocalPath = req.files?.avatar[0]?.path; // multer.middleware wali file se humhe path kaoriginal name mila jayega jo yha pass krdega
 const coverImageLocalPath =  req.files?.coverImage[0]?.path;

 if(!avatarLocalPath){
throw new ApiError(400, "Avatar file is required ")
 }

//upload them to cloudinary
const avatar = await uploadOnCloudinary(avatarLocalPath);
const coverImage = await uploadOnCloudinary(coverImageLocalPath);

if(!avatar){
  throw new ApiError(400, "Avatar file is required ");
}

const user = await User.create({
  fullname,
  avatar:avatar.url,
  coverImage: coverImage?.url || "",
  email,
  password,
  username: username.toLowerCase()
})

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    )
if(!createdUser){
  throw new ApiError(500, "Something went wrong while registering a user!")
}


// return res
return res.status(201).json(
  new ApiResponse(200, createdUser, "User Registered SuccessFully! 🎉")
)
})
export { registerUser };
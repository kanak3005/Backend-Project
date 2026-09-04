import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js"
import {User} from"../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { upload } from '../middlewares/multer.middleware.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken"
// //User ID
//    ↓
// Database se user nikalo
//    ↓
// Access Token generate karo
//    ↓
// Refresh Token generate karo
//    ↓
// Refresh Token DB me save karo
//    ↓
// Dono tokens return karo

const generateAccessAndRefreshTokens = async (userId) => {
  try{
     const user = await User.findById(userId)
     const accessToken = user.generateAccessToken()
     const refreshToken = user.generateRefreshToken()

     // refresh token ko db m kaise daale ?
     user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false }) 
//validateBeforeSave: false ka matlab:
//  Save karte waqt Mongoose ki normal validation dobara mat chalao.
//Ye yaha isliye commonly use kiya jata hai kyunki hum sirf refreshToken update kar rahe hain.
    return {accessToken, refreshToken}
  }

  catch(error){
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}
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
const {fullname, email, username, password} = req.body // req.body - sara data aa jaata ye express provide krta h
//console.log("USER Detail", req.body);


// validation - kch empty toh nhi hai ? instead of ek - ek field check krte humne ek sath check krlia
// if(fullname === ""){
//   throw new ApiError(400, "fullname is required")
// }
if(
  [fullname,email,username, password].some((field) =>  //.some - Kya array mein kam se kam ek element condition satisfy karta hai?
  field?.trim() === "") // if koi field empty h toh return true
){
 throw new ApiError(400, "All fields is required") // agar true h to ye error dega
}


// check if user  is already exist check - username, email
const existedUser = await User.findOne({ //User.findOne() - Kya koi aisa user already exist karta hai jiska username ya email same hai?
    $or: [{ username }, { email }] // username or email
})

if(existedUser){
  throw new ApiError(409, "User with email or username already exist")
}
//console.log(existedUser);

// check for images ,check for avatar
 // multer = req.files ka access de deta hai ( req.files - avatar, CoverImage)
 const avatarLocalPath = req.files?.avatar[0]?.path; // req.files.avatar[0] - first avatar file( maxCnt = 1) so normally first/only file [0] par hai.
 //Local file path. -> Example:  ./public/temp/kanak.jpg
 //const coverImageLocalPath =  req.files?.coverImage[0]?.path;
// console.log("Req.files:", req.files);

// check coverimage path h ya nhi if yes - then give a path to coverImageLocalPath
let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
  coverImageLocalPath = req.files.coverImage[0].path;
}


 if(!avatarLocalPath){
throw new ApiError(400, "Avatar file is required ")
 }

//upload them to cloudinary
const avatar = await uploadOnCloudinary(avatarLocalPath); // localPath cloudinary ko bhej do - response m vo ek url de dega
const coverImage = await uploadOnCloudinary(coverImageLocalPath);

if(!avatar){
  throw new ApiError(400, "Avatar file is required ");
}

const user = await User.create({
  fullname,
  avatar:avatar.url, // mongoDb m actual image ki jghusi url save krenge
  coverImage: coverImage?.url || "", // agar cloudinary se image mil gyi to save kro , vrna null save kro
   email: email.toLowerCase(),
  password,
  username: username.toLowerCase()
})

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"  // - means exclude.
      // Result mein password aur refreshToken mat do. password, refresh token response m nhi bhejna
    )
if(!createdUser){
  throw new ApiError(500, "Something went wrong while registering a user!")
}


// return res
return res.status(201).json(//201 Created - New resource successfully created.   .json() - Frontend ko JSON response bhejo.
  new ApiResponse(200, createdUser, "User Registered SuccessFully! 🎉")
)
})

const loginUser = asyncHandler( async (req, res) => {
// req body -> data
// username or email
// find the user 
// password check if login 
// password agr shi then generate access token & refresh token generate krke user ko bhejenge
// tokens ko cookie m send krte h

// get data from client/frontend 
const {email, username, password } = req.body

    if (!(email || username)) {
        throw new ApiError(400, "username or email is required");
    }
// find the user
const user = await User.findOne({
    $or: [
        { username: username?.toLowerCase() },
        { email: email?.toLowerCase() }
    ]
});

 console.log("FOUND USER:", user);

if(!user){
  throw new ApiError(404, "User Does Not Exist")
}
//check password
const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordValid){
  throw new ApiError(404, "Password is incorrect");
}

 const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

const loggedInUser = await User.findById(user._id).
select("-password -refreshToken")


// send cookies
const options = {
  httpOnly: true, // ye cookie sirf server se modify ho skti h frontend ki jgh
  secure: true
}
return res
.status(200)
.cookie("accessToken",accessToken, options)
.cookie("refreshToken", refreshToken, options)
.json(
  new ApiResponse( // utils folder m jo humne ApiResponse file bnayi vha se hum --
    200, //status code
    //data
    {
      user: loggedInUser, accessToken, refreshToken
    },
    // message
    "User logged In Successfully" // message
  )
)
})


// logout 

const logoutUser = asyncHandler(async(req, res) => {
 await User.findByIdAndUpdate(
    req.user._id,
    {
        $set: {
          refreshToken: undefined
        }
      },
        {
          new: true
        }
    
  )
  const options = {
  httpOnly: true, // ye cookie sirf server se modify ho skti h frontend ki jgh
  secure: true
}
return res.
status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

if (!incomingRefreshToken){
  throw new ApiError(401, "unauthorized request")
}
try{
  
const decodedToken =  jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET

  )
  const user = User.findById(decodedToken?._id)

  if(!user){
    throw new ApiError(401, "Invalid refreshtoken")
   }

   if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired")
   }
 
const options={
  httpOnly: true,
  secure: true
}
const {accessToken, newRefreshToken} = await 
generateAccessAndRefreshTokens(user,_id)

return res
.status(200)
.cookie("accessToken", options)
.cookie("newRefreshToken", options)
.json(
  new ApiResponse(
    200,
    {accessToken, refreshToken: newRefreshToken},
    "Access token refreshed"
  )
)
}
catch(error){
throw new ApiError(401, error?.message || "Invalid refresh token")
}

})
export { 
  registerUser,
   loginUser,
  logoutUser,
  refreshAccessToken
};
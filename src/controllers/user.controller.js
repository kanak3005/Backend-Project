import mongoose from "mongoose";
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js"
import {User} from"../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { upload } from '../middlewares/multer.middleware.js';
import { Subscription } from "../models/subscription.model.js";
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
        $unset: {
          refreshToken: 1 //this remove the field from document
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

const changePassword = asyncHandler(async (req, res) => {
  const {oldPassword, newPassword} = req.body
  const user = User.findById(req.user?._id) // req.user - ye auth.middleware.js m set hua h, ye user ka data contain krta h vha se hum user ki id le rhe h
 const isPasswordCorrect = await user.isPasswordCorrect(oldPassword) // isPasswordCorrect - ye user.model.js m likha h, ye check karega ki entered password stored hash ke corresponding hai ya nahi.
  if(!isPasswordCorrect){
    throw new ApiError(400, "Old password is incorrect")
  }
  user.password = newPassword // new password ko hash krne ka kaam pre save hook m ho jaayega jo humne user.model.js m likha h - ye password humne user m set kiya h save nhi
  await user.save({validateBeforeSave: false}) // validateBeforeSave: false ka matlab: Save karte waqt Mongoose ki normal validation dobara mat chalao.
  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password changed successfully"))
})

// how to get a current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
  .status(200)
  .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res) => {
const {fullname, email} = req.body

  if(!fullname || !email){
    throw new ApiError(400, "All fields are required")
}
   const user =  await User.findByIdAndUpdate( // findByIdAndUpdate -Kisi particular _id wale document ko find karo aur usko update karo.
      req.user?._id,
      {
        $set:  { // given fields ki values ko update/set karo
          fullname: fullname,
          email: email.toLowerCase()
        }
      },
      {new: true} // update hone ke baad jo info/details  h vo return hori 
).select("-password")
return res
.status(200)
.json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
  const avatarLocalPath = req.file?.path 
  //req.file kya hai?
// Jab user frontend/Postman se avatar image upload karta hai, multer middleware us uploaded file ki information req.file me daal deta hai.
// "Jo avatar user ne upload kiya hai, woh server ke kis local location par temporarily saved hai? Uska path mujhe de do."

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")

}
const avatar = await uploadOnCloudinary(avatarLocalPath) //Local image ko Cloudinary par upload karo.

if(!avatar.url){ //Cloudinary se URL mila ya nahi check karo.
  throw new ApiError(400, "Something went wrong while uploading avatar")
}
    const user = await User.findByIdAndUpdate( //Currently logged-in user ko find karke uska avatar update karo.
      req.user?._id,
      {
        $set: {
          avatar: avatar.url //MongoDB me Cloudinary URL save karo.
        }
      },
      {new: true}
    ).select("-password")
    // delete old avatar from cloudinary
 const oldAvatarPublicId = user.avatar?.public_id;
await deleteFromCloudinary(oldAvatarPublicId); 

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async(req, res ) => {
  const coverImageLocalPath = req.file?.path //req.file kya hai?
//Jab user frontend/Postman se avatar image upload karta hai, multer middleware us uploaded file ki information req.file me daal deta hai.

  if(!coverImageLocalPath){
    throw new ApiError(400, "Cover image file is required")
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if(!coverImage.url){
    throw new ApiError(400, "Something went wrong while uploading cover image")
  }
   const user =  await User.findByIdAndUpdate(
    req.user?._id,{
      $set:{
        coverImage: coverImage.url
      }
    },
    {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200, user, "Cover image updated successfully"))
    
})

const getUserChannelProfile =  asyncHandler(async(req, res) => {
  const {username} = req.params // hum username url se le rhe h, jaise /api/users/:username
  if(!username?.trim()){ // trim() - ye string ke starting aur ending m jo extra space h usko remove krta h
    throw new ApiError(400, "Username is required")   
  }
  const channel = await User.aggregate([
   {
    $match:{username: username?.toLowerCase()}
   },
   {
    // humhe pw channel ke subscriber count krne h - toh hum har document m vo channel find krke count krenge ki us channel ke kitne subscribers h
    $lookup:{ //Subscribers find karna
      from: " subscriptions", // subscription collection me jao
      localField: "_id", // Current User document ki _id ko use karo. _id = user1
      foreignField: "channel", // subscriptions collection me channel field check kro. user._id = subscription.channe match krega
      as: "subscribers" // Jo matching subscriptions mili hain, unko ek array me store karo:
    }
   },
   // aab mene / kisi user ne kitne channels subscribe kiye h - vo count krne h - toh hum har uss user ke document m vo channel find krke count krenge ki us user ne kitne channels subscribe kiye h
   {
  $lookup: {
    from: "subscriptions", //subscriptions collection me jao.
   localField: "_id", //Current User document ki _id ko use karo. _id = user1
    foreignField: "subscriber", // Subscription collection me: subscriber field ke andar U1 search karo.
    as: "subscribedTo"  // subscribed channel
  }
   },
   {
    $addFields: {
      subscribersCount: {
        $size: "$subscribers"
      },
      channelSubscribedToCount: {
        $size: "$subscribedTo"
      },
      // Currently logged-in user ne ye channel subscribe kiya hai ya nahi?
      isSubscribed: {
        $cond: {
          if: { $in: [req.user?._id, "$subscribers.subscriber"] },
          then: true,
          else: false
        }
      }
    }
   },
   {
    $project: {
      fullname: 1,
      username: 1,
      email: 1,
      avatar: 1,
      coverImage: 1,
      subscribersCount: 1,
      channelSubscribedToCount: 1,
      isSubscribed: 1
    }
   }
   ])
   if(!channel?.length){
    throw new ApiError(404, "Channel not found")
   }
   return res
   .status(200)
   .json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"))
})
//Ye getWatchHistory controller current logged-in user
//  ki watch history nikalta hai, aur har watched video ke saath us video ke owner ki basic information (fullname, username, avatar) bhi laata hai.
// User → watchHistory IDs → Videos → Video owner → Owner details → Response
const getWatchHistory = asyncHandler(async(req, res) => {
const user = await User.aggregate([ // users collection ke data par multiple database operations perform karo.
  {
    $match: { //$match ka kaam hai:
// Database mein sirf required document select karna.
// Yahan hum current logged-in user ko find kar rahe hain.
      _id: new mongoose.Types.ObjectId(req.user?._id) //Agar req.user._id string form mein hai, to hum usko MongoDB ObjectId mein convert kar rahe hain.
    }
  },{
    //User ki watchHistory mein jo Video IDs hain, un IDs se videos collection ke actual video documents nikalna.
    $lookup: { // mongoDb ka Join operation
      from: "videos", // Videos collection se data lao.
      localField: "watchHistory", // Current collection (users) mein jis field se matching karni hai, uska naam.
      foreignField: "_id",
      //localField = mere/current document mein field
  // foreignField = jis collection se data la raha hoon, usmein matching field.
      as: "watchHistory",
      pipeline: [ //Videos ko lookup karne ke baad un videos par additional operations perform karo.
        {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                fullname: 1,
                username: 1,
                avatar: 1
              }
            }
          ]
        }
      },{
        $addFields: {
            owner: {
              $first: "$owner" //$lookup normally result ko array mein deta hai.But humein ek hi owner chahiye. so ye array ka first element nikaal dega.
            }
        }
      }
      ]
    }
  }
])
return res
.status(200)
.json(new ApiResponse(200, user[0]?.watchHistory, "Watch history fetched successfully")) //Aggregation always returns an array.
// Humne $match mein _id se ek specific user find kiya hai.
})

export { 
  registerUser,
   loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
}
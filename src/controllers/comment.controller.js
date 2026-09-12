import mongoose, {isValidObjectId} from "mongoose"
import { Comment } from "../models/comment.model" // iske through hum comment find,update, create , delete kar skte hai 
import { Video } from "../models/video.model.js" //Ye check karne ke liye use hota hai ki jis video par comment kiya ja raha hai, woh video actually exist karti hai ya nahi.

import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Video ke comments fetch karna
// New comment add karna
// Existing comment update karna
// Comment delete karna

// Get all comment for a video
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params; //Gets the video ID from the URL.
  const{ page = 1, limit = 10} = req.query
  // validate videoId
  if(!isValidObjectId(videoId)){
    throw new ApiError(400, "Inavlid videoId")
  }
  // check whether video exists or not - Video exist karti hai ya nahi
  const video = await Video.findById(videoId)

  //Agar video hi exist nahi karti, toh uske comments fetch karna meaningless hai.
  if(!video){
    throw new ApiError(400, "video not found!")
  }
 // convert query values from string to num
 const pageNumber = Math.max(Number(page), 1); //Math.max(Number(page), 1) ensure karta hai ki page minimum 1 ho.
 const limitNumber = Math.max(Number(limit), 1); //Limit bhi minimum 1 hogi.

 // pagination formula 
 const skip = ( pageNumber - 1) * limitNumber
 // Get comments - Sirf un comments ko find karo jinka video field given videoId ke equal hai.
 const comments = await Comment.find({
    video: videoId
 })
.populate(  //populate() owner ID ko actual user details se replace karta hai.
    "owner",
     "username fullname avatar"
)
.sort({
    createdAt: -1  //-1 → descending, new to old
})
.skip(skip)
.limit(limitNumber)
})
// Ye given video ke total comments count karta hai.
const totalComments = await Comment.countDocuments({
        video: videoId
    })
const totalPages = Math.ceil(totalComments / limitNumber)
// eg - totalPages = Math.ceil(23 / 10)
//      totalPages = Math.ceil(2.3)
//      totalPages = 3

return res.status(200).json(
    new ApiResponse(
        200,
        {
            Comment,
            pagination: {
                currentPage: pageNumber,
                limit: limitNumber,
                totalComments,
                totalPages,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1
            }
        },
        "Video comments fetched successfully"
    )
)


// add a new Comments
// Logged-in user ko kisi video par comment karne dena.
const addComment = asyncHandler( async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body
    
     if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required")
    }
   // find a video 
   const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
     const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }
    const comment = await Comment.create({ //Ye line MongoDB mein ek new comment document create karti hai.
        content: content.trim(), //User ka actual comment store hoga.
        video: videoId,  //Ye comment kis video par kiya gaya hai?
        owner: userId //Ye comment kis user ne kiya hai?
    }) 
    if (!comment) { //Comment create hua ya nahi?
        throw new ApiError(500, "Something went wrong while adding comment")
    }
     // Comment.create() se comment create ho gaya.
     // Ab hum us comment ki ID use karke usko dobara find kar rahe hain.
     const createdComment = await Comment.findById(comment._id)
        .populate("owner", "username fullname avatar") //populate() owner ID ko actual User details se replace karta hai.

    return res.status(201).json(
        new ApiResponse(
            201,
            createdComment,
            "Comment added successfully"
        )
    )
})

// ======================================
// UPDATE COMMENT - Ye function existing comment ko edit/update karta hai.
// ======================================
const updateComment = asyncHandler(async (req, res) => {
   //commentId → kis comment ko update karna hai?
  //content → usmein kya new text save karna hai?
    const { commentId } = req.params
    const { content } = req.body

    // Validate commentId
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    // Validate content -- Content missing toh nahi hai.
//    Content sirf spaces toh nahi hai.
    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required")
    }

    // Find comment -MongoDB se given commentId wala comment find hota hai.
    // jis comment ko update krna h vo dhoondo
    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }

    //   Check comment ownership -Kya current logged-in user hi comment ka owner hai?
    //   Dono same hain, toh update allowed.
    if (comment.owner.toString() !== userId.toString()) { //Dono same hain, toh update allowed.
        throw new ApiError(
            403, // User logged-in hai, lekin uske paas is comment ko update karne ka permission nahi hai.
            "You are not authorized to update this comment"
        )
    }

    // Update comment
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content.trim()
            }
        },
        {
            new: true,
            runValidators: true  //Update ke time bhi schema ke validation rules apply karo.
        }
    )
    //Comment ke owner field mein sirf User ID hoti hai.
    //populate() us ID ki actual user details fetch karta hai.
        .populate(
            "owner",
            "username fullname avatar"
        )

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedComment,
            "Comment updated successfully"
        )
    )
})


// ======================================
// DELETE COMMENT
// ======================================
const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params // why we write { commentId } in curly braces ? - destructing way / is just a shorter way of writing:
    // Object ke andar se required property nikaal kar ek variable bana do.
    // or const commentId = req.params.commentId


    // Validate commentId
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    // Find comment
    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }

    // Check comment ownership
    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to delete this comment"
        )
    }

    // Delete comment
    await Comment.findByIdAndDelete(commentId)

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Comment deleted successfully"
        )
    )
})


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
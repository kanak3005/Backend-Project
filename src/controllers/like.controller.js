import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Video ko like/unlike karna.
// Comment ko like/unlike karna.
// Tweet ko like/unlike karna.
// Current user ke saare liked videos fetch karna


// TOGGLE VIDEO LIKE
//Like hai       → Unlike karo
//Like nahi hai  → Like karo

const toggleVideoLike = asyncHandler(async (req, res) => {

    const { videoId } = req.params // url se videoId lena

    // Check videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const userId = req.user?._id

    // Check whether user already liked this video
    const existingLike = await Like.findOne({ //Kya iss user ne is video ko pehle se like kiya hua hai?
        video: videoId,
        likedBy: userId
    })

    // If already liked → remove like
    if (existingLike) {

        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(
            new ApiResponse(
                200,
                { liked: false }, //liked: false frontend ko batata hai - Ab video liked nahi hai.
                "Video unliked successfully"
            )
        )
    }
     //Agar existingLike nahi mila, to user ne video ko like nahi kiya hai.
    // If not liked → create like
    const like = await Like.create({
        video: videoId,
        likedBy: userId
    })

    if (!like) { //Like create hua ya nahi check karna
        throw new ApiError(500, "Something went wrong while liking video")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            { liked: true },
            "Video liked successfully"
        )
    )
})


// ==============================
// TOGGLE COMMENT LIKE
// ==============================
const toggleCommentLike = asyncHandler(async (req, res) => {

    const { commentId } = req.params

    // Check commentId
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    const userId = req.user?._id //Current logged-in user ki ID.

    // Check whether user already liked this comment
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    // Already liked → unlike
    if (existingLike) {

        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(
            new ApiResponse(
                200,
                { liked: false },
                "Comment unliked successfully"
            )
        )
    }

    // Not liked → like
    const like = await Like.create({
        comment: commentId,
        likedBy: userId
    })

    if (!like) {
        throw new ApiError(500, "Something went wrong while liking comment")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            { liked: true },
            "Comment liked successfully"
        )
    )
})


// ==============================
// TOGGLE TWEET LIKE
// ==============================
const toggleTweetLike = asyncHandler(async (req, res) => {

    const { tweetId } = req.params

    // Check tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }

    const userId = req.user?._id

    // Check whether user already liked this tweet
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    // Already liked → unlike
    if (existingLike) {

        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(
            new ApiResponse(
                200,
                { liked: false },
                "Tweet unliked successfully"
            )
        )
    }

    // Not liked → like
    const like = await Like.create({
        tweet: tweetId,
        likedBy: userId
    })

    if (!like) {
        throw new ApiError(500, "Something went wrong while liking tweet")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            { liked: true },
            "Tweet liked successfully"
        )
    )
})


// GET ALL LIKED VIDEOS
//Current logged-in user ne jitne videos like kiye hain, unhe fetch karna.
const getLikedVideos = asyncHandler(async (req, res) => {

    const userId = req.user?._id // current user ki id
     // Find user's video likes
    const likedVideos = await Like.find({
        likedBy: userId, //Sirf current user ke likes chahiye.
        //video field present bhi ho aur null bhi na ho.
        video: { $exists: true, $ne: null } //$exist: true means - fiels exist krta h ya nhi(Video exist - true), $ ne: null ke equal nahi hona chahiye.
    })
    .populate(
        "video",
        "videoFile thumbnail title description duration views isPublished owner createdAt"
    ) //Tum specify kar rahe ho ki Video document se ye fields chahiye.

    return res.status(200).json(
        new ApiResponse(
            200,
            likedVideos,
            "Liked videos fetched successfully"
        )
    )
})


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
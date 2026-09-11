import mongoose, { isValidObjectId } from "mongoose" // isValidObjectId - Controller = Ye bas check karta hai ki koi ID valid MongoDB ObjectId format mein hai ya nahi.

import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

// User
//  │
//  ├── Upload Video
//  │       ↓
//  │   publishAVideo()
//  │
//  ├── See All Videos
//  │       ↓
//  │   getAllVideos()
//  │
//  ├── Open One Video
//  │       ↓
//  │   getVideoById()
//  │
//  ├── Edit Video
//  │       ↓
//  │   updateVideo()
//  │
//  ├── Delete Video
//  │       ↓
//  │   deleteVideo()
//  │
//  └── Publish / Unpublish
//          ↓
//      togglePublishStatus()
//Controller = request aayi → processing hui → database/Cloudinary ka kaam hua → response gaya.

// GET ALL VIDEOS


const getAllVideos = asyncHandler(async (req, res) => { //Ye function saare videos fetch karta hai.

    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt", //kis field ke according sort kre ? eg - views
        sortType = "desc", // descending - Newest video to oldest
        userId
    } = req.query // url se ye values nikal lo
    //req.query - url ke query parameters ko read krne ke liye


    const matchStage = { //Sirf published videos lao.
        isPublished: true
    }

    // Search videos by title or description
    if (query?.trim()) {

        matchStage.$or = [
            {
                title: {
                    $regex: query.trim(), // $regex- mongoDB m text ke andar search/filter/ matching krne ke liye
                    $options: "i" //means case-insensitive. java, JAVA JaVa sab allow h
                }
            },
            {
                description: {
                    $regex: query.trim(),
                    $options: "i"
                }
            }
        ]
    }

    // Filter videos according to owner
    if (userId) {

        if (!isValidObjectId(userId)) { //userId valid MongoDB ID hai ya nahi?
            throw new ApiError(400, "Invalid userId")
        }

        matchStage.owner = new mongoose.Types.ObjectId(userId) // UserId initially string hota hai, MongoDB mein owner ObjectId hai. string -> objectId
    }

    //sort
     // user nhi bhejta toh hum calculate krlete hai but sortype = desc 
    const sortOrder = sortType === "asc" ? 1 : -1
     //Videos ko createdAt ke according descending order mein arrange karo.
// Video A → 10 Sept -> newest
// Video B → 8 Sept
// Video C → 5 Sept
// Video D → 1 Sept -> oldest
   
    // Aggregation
   
    const pipeline = Video.aggregate([

        // Only published videos
        {
            $match: matchStage
        },

        // Sort videos
        {
            $sort: {
                [sortBy]: sortOrder // since sortType = "desc" so sortOrder = -1
            }
        },

        // Get owner information
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },

        // Convert owner array into object
        {
            $unwind: "$owner" //$unwind array ko object-like structure mein flatten(single object) karta hai.
        },

        // Return required fields
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,

                "owner._id": 1,
                "owner.username": 1,
                "owner.fullname": 1,
                "owner.avatar": 1
            }
        }
    ])

    // Pagination
   
    const options = {
        page: Number(page), // convert string to number(tyecast)
        limit: Number(limit)
    }
  // Jo aggregation pipeline humne banayi hai(videos -> $match -> $sort -> $lookup -> $project), ye final data aa gaya.
// Ab isko page aur limit ke according divide karke do.
    const videos = await Video.aggregatePaginate( //Ye pipeline ko pagination ke saath execute karta hai.
        pipeline,
        options
    )
    //options = "kitna aur kaunsa page?"
    // aggregatePaginate() = "data ko us page mein laao."

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        )
    )
})


// =====================================================
// PUBLISH A VIDEO
// =====================================================
//User video upload kare → Cloudinary → MongoDB.
const publishAVideo = asyncHandler(async (req, res) => {

    const {
        title,
        description
    } = req.body

    // -------------------------------------------------
    // Validation
    // -------------------------------------------------

    if (!title?.trim()) { // Agar title nahi hai OR empty hai.
        throw new ApiError(400, "Title is required")
    }

    if (!description?.trim()) {
        throw new ApiError(400, "Description is required")
    }

    // -------------------------------------------------
    // Get files from multer
    // -------------------------------------------------
  // videoFile array ka first file lo aur uska path lo.
    const videoFileLocalPath =
        req.files?.videoFile?.[0]?.path

    const thumbnailLocalPath =
        req.files?.thumbnail?.[0]?.path

    if (!videoFileLocalPath) {
        throw new ApiError(
            400,
            "Video file is required"
        )
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(
            400,
            "Thumbnail is required"
        )
    }

    // -------------------------------------------------
    // Upload video to Cloudinary
    // -------------------------------------------------

    const videoFile = await uploadOnCloudinary(
        videoFileLocalPath
    )

    if (!videoFile) {
        throw new ApiError(
            500,
            "Video upload failed"
        )
    }

    // -------------------------------------------------
    // Upload thumbnail to Cloudinary
    // -------------------------------------------------

    const thumbnail = await uploadOnCloudinary(
        thumbnailLocalPath
    )

    if (!thumbnail) {
        throw new ApiError(
            500,
            "Thumbnail upload failed"
        )
    }

    // -------------------------------------------------
    // Create video in MongoDB
    // -------------------------------------------------

    const video = await Video.create({

        videoFile: videoFile.url,

        thumbnail: thumbnail.url,

        title: title.trim(),

        description: description.trim(),

        duration: videoFile.duration || 0,

        owner: req.user?._id,

        views: 0,

        isPublished: true
    })

    if (!video) {
        throw new ApiError(
            500,
            "Something went wrong while publishing video"
        )
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            video,
            "Video published successfully"
        )
    )
})


// =====================================================
// GET VIDEO BY ID
// =====================================================

const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    // Validate ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid videoId"
        )
    }

    // Find video
    const video = await Video.findById(videoId) // MongoDB se video find.
        .populate( // populate() ka use hota hai MongoDB ke referenced ID ki jagah uski actual information laane ke liye.
 //"Video ke owner field mein jo User ID hai, us ID se User collection mein jao aur ye information(username fullname avatar) le aao."
            "owner",
            "username fullname avatar"
        )

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        )
    }

    // Increase views
    video.views += 1 // yaha ye video user ko di di jayegi jab bhi vo request krega toh sath hi count bhi bdega

    await video.save() //MongoDB mein updated views save.

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video fetched successfully"
        )
    )
})


// =====================================================
// UPDATE VIDEO
// =====================================================
// purpose - Title update || Description update || Thumbnail update
const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    const {
        title,
        description
    } = req.body

    // -------------------------------------------------
    // Validate video ID
    // -------------------------------------------------

    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid videoId"
        )
    }

    // -------------------------------------------------
    // Find video
    // -------------------------------------------------

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        )
    }

    // -------------------------------------------------
    // Check owner
    // -------------------------------------------------

    if ( //Kya jis user ne request bheji hai, wahi video ka owner hai? means jo user update krna chahta vo uski hi id hai ya nhi
        video.owner.toString() !==
        req.user?._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to update this video"
        )
    }

    // -------------------------------------------------
    // Prepare update
    // -------------------------------------------------

    const updateData = {}

    if (title?.trim()) {
        updateData.title = title.trim()
    }

    if (description?.trim()) {
        updateData.description = description.trim()
    }

    // -------------------------------------------------
    // Update thumbnail if provided
    // -------------------------------------------------
   //Thumbnail = video ka cover/preview image.
    const thumbnailLocalPath =
        req.file?.path

    if (thumbnailLocalPath) {

        const thumbnail =
            await uploadOnCloudinary(
                thumbnailLocalPath
            )

        if (!thumbnail) {
            throw new ApiError(
                500,
                "Thumbnail upload failed"
            )
        }

        updateData.thumbnail = thumbnail.url
    }

    if (Object.keys(updateData).length === 0) { // agar User ne kuch update hi nahi diya.
        throw new ApiError(
            400,
            "No data provided for update"
        )
    }

    // -------------------------------------------------
    // Update database
    // -------------------------------------------------

    const updatedVideo =
        await Video.findByIdAndUpdate(
            videoId,

            {
                $set: updateData
            },

            {
                new: true // updated/new document return karo.
            }
        )

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video updated successfully"
        )
    )
})


// =====================================================
// DELETE VIDEO
// =====================================================

const deleteVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    // Validate ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid videoId"
        )
    }

    // Find video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        )
    }

    // -------------------------------------------------
    // Check owner
    // -------------------------------------------------

    if (
        video.owner.toString() !==
        req.user?._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to delete this video"
        )
    }
    // delete the video from mongoDb
await Video.findByIdAndDelete(videoId) //MongoDB se video delete.

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Video deleted successfully"
        )
    )
})


// =====================================================
// TOGGLE PUBLISH STATUS
// =====================================================
//publish status - true  → false
//                 false → true   That's why it is called toggle.
//Current publish status ko opposite kar dena.
const togglePublishStatus = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    // Validate ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid videoId"
        )
    }

    // Find video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        )
    }

    // -------------------------------------------------
    // Check owner
    // -------------------------------------------------

    if (
        video.owner.toString() !==
        req.user?._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to change publish status"
        )
    }

    // -------------------------------------------------
    // Toggle
    // -------------------------------------------------

    video.isPublished = !video.isPublished

    await video.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            `Video ${
                video.isPublished
                    ? "published"
                    : "unpublished"
            } successfully`
        )
    )
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
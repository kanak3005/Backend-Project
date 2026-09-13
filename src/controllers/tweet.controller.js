import { isValidObjectId } from "mongoose";

import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// CREATE TWEET
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    // Check content
    if (!content || !content.trim()) {
        throw new ApiError(400, "Tweet content is required");
    }

    // Get logged-in user's ID
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User is not authenticated");
    }

    // Create tweet
    const tweet = await Tweet.create({
        content: content.trim(),
        owner: userId
    });

    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating tweet");
    }

    // Fetch created tweet with owner details
    const createdTweet = await Tweet.findById(tweet._id)
        .populate("owner", "username fullname avatar");

    return res.status(201).json(
        new ApiResponse(
            201,
            createdTweet,
            "Tweet created successfully"
        )
    );
});


// GET USER TWEETS
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Check userId
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    // Check whether user exists
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Find all tweets of this user
    const tweets = await Tweet.find({
        owner: userId
    })
        .populate("owner", "username fullname avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            tweets,
            "User tweets fetched successfully"
        )
    );
});


// UPDATE TWEET
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    // Check tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    // Check content
    if (!content || !content.trim()) {
        throw new ApiError(400, "Tweet content is required");
    }

    // Find tweet
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Get logged-in user
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User is not authenticated");
    }

    // Check ownership
    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this tweet"
        );
    }

    // Update tweet
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: content.trim()
            }
        },
        {
            new: true,
            runValidators: true
        }
    ).populate("owner", "username fullname avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedTweet,
            "Tweet updated successfully"
        )
    );
});


// DELETE TWEET
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // Check tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    // Find tweet
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Get logged-in user
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User is not authenticated");
    }

    // Check ownership
    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to delete this tweet"
        );
    }

    // Delete tweet
    await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    );
});


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};
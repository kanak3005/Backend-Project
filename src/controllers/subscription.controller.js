import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

//subscriber = jo subscribe kar raha hai
//channel    = jisko subscribe kiya ja raha hai

// Toggle subscription 
// Subscribe hai?
//       ↓
//  YES → Unsubscribe
//  NO  → Subscribe
const toggleSubscription = asyncHandler(async (req, res) => {

    const { channelId } = req.params

    // 1. Check channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    // 2. Check whether channel exists
    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel does not exist")
    }

    // 3. Current logged-in user
    const subscriberId = req.user?._id

    // 4. User cannot subscribe to himself
    if (subscriberId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }

    // 5. Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    // 6. If already subscribed → unsubscribe
    if (existingSubscription) {

        await Subscription.findByIdAndDelete(existingSubscription._id)

        return res.status(200).json(
            new ApiResponse(
                200,
                { subscribed: false },
                "Channel unsubscribed successfully"
            )
        )
    }

    // 7. If not subscribed → create subscription
    const subscription = await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    })

    if (!subscription) {
        throw new ApiError(500, "Something went wrong while subscribing")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            { subscribed: true },
            "Channel subscribed successfully"
        )
    )
})


// Controller to return subscriber list of a channel
//Ek particular channel ko kitne log subscribe kar rahe hain?
const getUserChannelSubscribers = asyncHandler(async (req, res) => {

    const { channelId } = req.params

    // 1. Validate channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    // 2. Check whether channel exists
    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel does not exist")
    }

    // 3. Find all subscribers of this channel
    const subscribers = await Subscription.find({ // subscription model m - subcribers , channel ke records honge na
        channel: channelId // suppose channel Id = PW 
        // Aise saare subscription records dhundo jinka channel PW hai.
        //Kaun-kaun is channel ko subscribe karta hai?
        // [
//    {
//       subscriber: Rahul_ID,
//       channel: PW
//    },
//    {
//       subscriber: Aman_ID,
//       channel: PW
//    },
//    {
//       subscriber: Priya_ID,
//       channel: PW
//    }
// ]  Abhi humein actual Rahul/Aman/Priya ki details nahi mili hain. Sirf unki IDs mili hain.
    })
    .populate(  //subscriber field mein jo User ID hai, us ID se User collection mein jao aur user ki information lao.(Un subscribers ki actual User information bhi le aao)
        "subscriber",
        "username fullname avatar"
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribers,
            "Channel subscribers fetched successfully"
        )
    )
})


// Controller to return channel list to which user has subscribed
//Ek user ne kin-kin channels ko subscribe kiya hai?
const getSubscribedChannels = asyncHandler(async (req, res) => {

    const { subscriberId } = req.params

    // 1. Validate subscriberId
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId")
    }

    // 2. Check whether subscriber exists
    //Kya is ID ka user database mein actually present hai?
    const subscriber = await User.findById(subscriberId)

    if (!subscriber) {
        throw new ApiError(404, "Subscriber does not exist")
    }

    // 3. Find all channels subscribed by this userSubscription Collection

// 1. subscriber: Kanak_ID
// channel:   Tech_ID

// 2. subscriber: Kanak_ID
// channel:   DSA_ID

// 3. subscriber: Kanak_ID
// channel:   Coding_ID

// 4. subscriber: Rahul_ID
// channel:   XYZ_ID
// if subscriberId = kanak_ID h toh Jinke subscriber field mein Kanak_ID hai, wo saare records lao.
    const subscribedChannels = await Subscription.find({
        subscriber: subscriberId
    })
    //Abhi channels ki actual information nahi hai, sirf IDs hain.
    .populate( //channel field mein jo User ID hai, us ID se User collection mein jao aur channel ki details lao.
        "channel",
        "username fullname avatar"
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribedChannels,
            "Subscribed channels fetched successfully"
        )
    )
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
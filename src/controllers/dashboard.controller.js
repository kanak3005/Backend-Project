import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//Ye controller different models se data calculate karega:
//Ye function channel ki overall performance nikalta hai.
const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views,
    //  total subscribers, total videos, total likes etc. -
    //  Dashboard par ye data cards ke form mein show hoga.
    const channelId = req.user?._id; //Logged-in user ki ID lena
    const totalVideos = await Video.countDocuments({ 
        owner: channelId
    }) //Video collection mein un videos ko count karo jinka owner logged-in user hai. ist returns only count not video

    // Humein channel ke videos ke views add karne hain.
    const totalViewsResult = await Video.aggregate([
        {
            $match: {  //Sirf un videos ko select karo jinka owner current channel hai.
                owner: new mongoose.Types.ObjectId(channelId) //Is field mein video upload karne wale user ki ID stored hoti hai.
            }
        },
        {
            //$group ka use selected documents ko group karke calculations karne ke liye hota hai.
            //Yahan hum sabhi selected videos ko ek single group mein rakh rahe hain aur unke views add kar rahe hain.
         $group: {
            _id:null, // Sabhi selected videos ko ek hi group mein rakho.
            totalViews: {
                $sum: "$views" //Har selected video ke views field ki value add karo.
        }
        }
        }
      
    ])
    const totalViews = totalViewsResult[0]?.totalViews || 0;

const totalSubscribers = await Subscription.countDocuments({
    channel: channelId
})
const totalLikes= await Like.countDocuments({
    video: {
        $in: await Video.find({owner: channelId}).distinct("_id")
    }
});
   return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalViews,
                totalSubscribers,
                totalLikes
            },
            "Channel stats fetched successfully"
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
const channelId = req.user?._id;
const videos = await Video.find({
    owner: channelId
}).sort({
    createdAt: -1
})
   return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Channel videos fetched successfully"
        )
    );
});

export {
    getChannelStats, 
    getChannelVideos
    }
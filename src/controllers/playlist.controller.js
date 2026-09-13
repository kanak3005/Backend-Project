import mongoose, {isValidObjectId} from "mongoose";
import { Playlist } from "../models/playlist.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";

const createPlaylist = asyncHandler( async ( req, res) => {
    const { name, description } = req.body;
     // Playlist name validate karo
     if( !name || !name.trim()){
        throw new ApiError(400, "PlayList name is required")
     }
    // logged in user ki id
    const userId = req.user?._id;
    if(!userId){
  throw new ApiError(401, "User is not authenticated");
    }
    // Playlist create kro 
    const playlist = await Playlist.create({
        name: name.trim(),
        description: description?.trim() || "",
        owner: userId,
        videos: [] // videos: [] ka matlab playlist create karte time videos ki list initially empty hai. Videos automatically nahi aayengi.
//Videos baad mein addVideoToPlaylist controller ke through add hongi.
    })
     if(!playlist){
           throw new ApiError(
            500,
            "Something went wrong while creating playlist"
        );
     }
     return res.status(201).json(
        new ApiResponse(
            201, 
            playlist,
            "Playlist create successfully"
        )
     )
})
//Given userId ke saare playlists database se fetch karna.
const getUserPlaylist = asyncHandler(async(req, res) => {
    const {userId} = req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "UserId is not Valid")
    }
    const user = await User.findById(userId)
   if(!user){
       throw new ApiError(404, "User does not exist");
   }
   // get user's playlist
   const playlists = await Playlist.find({
    owner: userId //Database mein woh playlists find karo jinka owner given userId ke equal hai.
   })
   .populate("videos", "title thumbnail duration")
   .sort({createdAt: -1});

   //send response
   return res.status(200).json(
    new ApiResponse(
        200,
        playlists,
        "User playlists fetched successfully"
    )
   )

})
//Ek particular playlist ki complete details uski playlistId se fetch karna.
//Playlist ID → Playlist details + uske videos

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
      if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }
    const playlist = await Playlist.findById(playlistId)
     .populate("owner", "username fullname avatar")
     .populate("videos", "title thumbnail videoFile duration");
    if(!playlist){
          throw new ApiError(404, "Playlist not found");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
  //findByIdAndUpdate- Mongoose ka method hai jo:
// Playlist ko uski ID se find karta hai
// Us playlist mein update karta hai
// Updated document return kar sakta hai
// structure - findByIdAndUpdate(
//     id, -> playlistId - Kis playlist ko update karna hai
//     update, -> { $push: ... } - Kya update karna hai
//     options -> { new: true } - Updated playlist return karo
// )
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        },
        {
            new: true
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video added to playlist successfully"
        )
    );
});
//playlist se video ID remove ka ( playlist se video ko remove kr dena)
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
     if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }
    // find Playlist
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
     // check playlist owner 
     if(!playlist.owner.toString() !== req.user?._id.toString()){
         throw new ApiError(
            403,
            "You are not authorized to modify this playlist"
        );
     }
    // 4. Remove video from videos array
    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
           $pull: {
            videos: videoId
           }
        },
        {
            new: true
        }
    );
      return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video removed from playlist successfully"
        )
    );
})
// puri playlist hi delete krni
const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
        // 1. Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    // 2. Find playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
 // 3. Check playlist owner
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to delete this playlist"
        );
    }

    // 4. Delete playlist
    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Playlist deleted successfully"
        )
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
     // 1. Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }
      // 2. At least one field should be provided
    if (
        (name === undefined || !name.trim()) &&
        (description === undefined || !description.trim())
    ) {
        throw new ApiError(
            400,
            "Name or description is required"
        );
    }
     // 3. Find playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // 4. Check playlist owner
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this playlist"
        );
    }
    const updateData = {};
    if(name !== undefined){
           if (!name.trim()) {
            throw new ApiError(400, "Playlist name cannot be empty");
        }
         updateData.name = name.trim();
    }
   if (description !== undefined) {
        updateData.description = description.trim();
    }
        // 6. Update playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: updateData
        },
        {
            new: true,
            runValidators: true
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Playlist updated successfully"
        )
    );
});



export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
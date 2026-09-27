import axiosClient from "./axiosClient";

// NOTE: Backend sirf "like" support karta hai, "dislike" nahi -
// isliye frontend me bhi sirf like button banayenge, dislike nahi.

export const toggleVideoLike = (videoId) => {
  return axiosClient.post(`/likes/toggle/v/${videoId}`);
};

export const toggleCommentLike = (commentId) => {
  return axiosClient.post(`/likes/toggle/c/${commentId}`);
};

export const getLikedVideos = () => {
  return axiosClient.get("/likes/videos");
};

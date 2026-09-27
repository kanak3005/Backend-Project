import axiosClient from "./axiosClient";

// Ye dono endpoints hamesha LOGGED-IN user ke apne channel ka data dete hai
// (backend khud req.user._id use karta hai, kisi param se nahi)
export const getChannelStats = () => {
  return axiosClient.get("/dashboard/stats");
};

export const getChannelVideos = () => {
  return axiosClient.get("/dashboard/videos");
};

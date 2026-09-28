import axiosClient from "./axiosClient";

export const getUserTweets = (userId) => axiosClient.get(`/tweets/user/${userId}`);

export const createTweet = (content) => axiosClient.post("/tweets", { content });

export const updateTweet = (tweetId, content) =>
  axiosClient.patch(`/tweets/${tweetId}`, { content });

export const deleteTweet = (tweetId) => axiosClient.delete(`/tweets/${tweetId}`);

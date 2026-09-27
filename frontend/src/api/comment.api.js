import axiosClient from "./axiosClient";

export const getVideoComments = (videoId, params = {}) => {
  return axiosClient.get(`/comments/${videoId}`, { params });
};

export const addComment = (videoId, content) => {
  return axiosClient.post(`/comments/${videoId}`, { content });
};

export const updateComment = (commentId, content) => {
  return axiosClient.patch(`/comments/c/${commentId}`, { content });
};

export const deleteComment = (commentId) => {
  return axiosClient.delete(`/comments/c/${commentId}`);
};

import axiosClient from "./axiosClient";

// Har function seedha backend ke /videos route se map hota hai — koi fake endpoint nahi

export const getAllVideos = (params = {}) => {
  // params: { page, limit, query, sortBy, sortType, userId }
  return axiosClient.get("/videos", { params });
};

export const getVideoById = (videoId) => {
  return axiosClient.get(`/videos/${videoId}`);
};

export const publishVideo = ({ title, description, videoFile, thumbnail }, onProgress) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("videoFile", videoFile);
  formData.append("thumbnail", thumbnail);
  return axiosClient.post("/videos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
};

export const updateVideo = (videoId, { title, description, thumbnail }) => {
  const formData = new FormData();
  if (title !== undefined) formData.append("title", title);
  if (description !== undefined) formData.append("description", description);
  if (thumbnail) formData.append("thumbnail", thumbnail);
  return axiosClient.patch(`/videos/${videoId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteVideo = (videoId) => {
  return axiosClient.delete(`/videos/${videoId}`);
};

export const togglePublishStatus = (videoId) => {
  return axiosClient.patch(`/videos/toggle/publish/${videoId}`);
};

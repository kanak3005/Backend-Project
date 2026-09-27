import axiosClient from "./axiosClient";

// Ye file sirf backend ke /users/* auth routes ko call karti hai.
// Har function ek real backend endpoint se correspond karta hai — koi fake data nahi.

export const registerUser = (formData) => {
  // formData ek FormData object hona chahiye (avatar/coverImage files ke liye)
  return axiosClient.post("/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const loginUser = ({ email, username, password }) => {
  return axiosClient.post("/users/login", { email, username, password });
};

export const logoutUser = () => {
  return axiosClient.post("/users/logout");
};

export const getCurrentUser = () => {
  return axiosClient.get("/users/current-user");
};

export const refreshAccessToken = () => {
  return axiosClient.post("/users/refresh-token");
};

export const changePassword = ({ oldPassword, newPassword }) => {
  return axiosClient.post("/users/change-password", { oldPassword, newPassword });
};

export const updateAccountDetails = ({ fullname, email }) => {
  return axiosClient.patch("/users/update-account", { fullname, email });
};

export const updateUserAvatar = (avatarFile) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);
  return axiosClient.patch("/users/update-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateUserCoverImage = (coverImageFile) => {
  const formData = new FormData();
  formData.append("coverImage", coverImageFile);
  return axiosClient.patch("/users/update-cover-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getUserChannelProfile = (username) => {
  return axiosClient.get(`/users/c/${username}`);
};

export const getWatchHistory = () => {
  return axiosClient.get("/users/watch-history");
};

import axiosClient from "./axiosClient";

export const createPlaylist = ({ name, description = "" }) =>
  axiosClient.post("/playlist", { name, description });

export const getUserPlaylists = (userId) => axiosClient.get(`/playlist/user/${userId}`);

export const getPlaylistById = (playlistId) => axiosClient.get(`/playlist/${playlistId}`);

export const addVideoToPlaylist = (videoId, playlistId) =>
  axiosClient.patch(`/playlist/add/${videoId}/${playlistId}`);

export const removeVideoFromPlaylist = (videoId, playlistId) =>
  axiosClient.patch(`/playlist/remove/${videoId}/${playlistId}`);

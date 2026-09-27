import axiosClient from "./axiosClient";

// Toggle: subscribe nahi hai to subscribe kar dega, subscribe hai to unsubscribe kar dega
export const toggleSubscription = (channelId) => {
  return axiosClient.post(`/subscriptions/c/${channelId}`);
};

// Note: ye dono list endpoints abhi bhi login-required hai backend me,
// isliye inhe hum sirf logged-in user ke apne dashboard jaisi jagah use karenge,
// public channel page par nahi (wahan sirf subscribersCount dikhta hai,
// jo getUserChannelProfile se hi mil jaata hai).
export const getChannelSubscribers = (channelId) => {
  return axiosClient.get(`/subscriptions/c/${channelId}`);
};

export const getSubscribedChannels = (subscriberId) => {
  return axiosClient.get(`/subscriptions/u/${subscriberId}`);
};

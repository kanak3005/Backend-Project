import axios from "axios";

// Ye ek hi axios instance hai jo poori app use karegi.
// Isse hume baar baar base URL aur headers likhne ki zaroorat nahi padegi.
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // .env se backend ka URL aata hai
  withCredentials: true, // IMPORTANT: isse browser accessToken/refreshToken cookies
  // automatically har request ke saath backend ko bhejega (backend cookie-based auth use karta hai)
});

// -----------------------------------------------------------------
// RESPONSE INTERCEPTOR: agar accessToken expire ho gaya (401 error),
// to automatically /users/refresh-token call karke naya token le lo,
// aur original request ko dobara try karo — user ko pata bhi nahi chalega.
// -----------------------------------------------------------------
let isRefreshing = false; // ek time par sirf ek hi refresh request jaaye
let pendingRequests = []; // jab tak refresh chal raha hai, baaki failed requests yahan ruki rahengi

const processPendingRequests = (error) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  pendingRequests = [];
};

axiosClient.interceptors.response.use(
  (response) => response, // agar response successful hai, kuch mat karo
  async (error) => {
    const originalRequest = error.config;

    // Sirf 401 (Unauthorized) par hi refresh try karo, aur ek request ko
    // dobara-dobara retry loop me mat daalo (_retry flag isliye laga rahe hain)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Agar login/refresh route khud hi fail hui, to refresh mat karo -
      // warna infinite loop ban jayega
      if (
        originalRequest.url?.includes("/users/login") ||
        originalRequest.url?.includes("/users/refresh-token")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Agar refresh already chal raha hai, to is request ko queue me daal do
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        })
          .then(() => axiosClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosClient.post("/users/refresh-token");
        processPendingRequests(null);
        return axiosClient(originalRequest); // original request ko naye token ke saath dobara chalao
      } catch (refreshError) {
        processPendingRequests(refreshError);
        // refresh bhi fail ho gaya matlab user ka session fully expire ho chuka hai
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

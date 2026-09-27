import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, logoutUser } from "../api/auth.api";

// Context banate hai jisme user ki info aur login/logout functions store honge
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // currently logged-in user ka data
  const [isLoading, setIsLoading] = useState(true); // "abhi check kar rahe hai ki login hai ya nahi"

  // -----------------------------------------------------------------
  // Page refresh hone par bhi login state bani rahe iske liye:
  // Component mount hote hi backend se pucho "current-user" kaun hai.
  // Cookie browser me already hai (agar user pehle se logged in tha),
  // isliye ye call automatically bata degi ki session valid hai ya nahi.
  // -----------------------------------------------------------------
  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.data.data); // ApiResponse ka shape: { data: { data: user, message, statusCode } }
      } catch (error) {
        // 401 aaya matlab koi valid session nahi hai — ye normal hai, error nahi
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkLoggedInUser();
  }, []);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    setUser(response.data.data.user);
    return response.data.data.user;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setUser, // profile/avatar update ke baad user object refresh karne ke liye expose kiya
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook - components isko use karenge instead of useContext(AuthContext) directly
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}

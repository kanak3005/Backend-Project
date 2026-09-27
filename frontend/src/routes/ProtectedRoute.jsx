import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Ye component kisi bhi page ko "login required" bana deta hai.
// Agar user login nahi hai, to use /login page par bhej dega,
// aur yaad rakhega ki wo kahan jaana chahta tha (login ke baad wapas wahi bhej sake).
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Jab tak hum check kar rahe hai ki user logged in hai ya nahi,
    // koi bhi decision mat lo — warna logged-in user bhi ek pal ke liye
    // login page dekh lega (flicker).
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

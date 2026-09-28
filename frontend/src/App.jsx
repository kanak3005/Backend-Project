import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Watch from "./pages/Watch";
import Channel from "./pages/Channel";
import UploadVideo from "./pages/UploadVideo";
import EditVideo from "./pages/EditVideo";
import Dashboard from "./pages/Dashboard";
import Playlist from "./pages/Playlist";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      {/* Login/Register apna full-screen layout use karte hai, Navbar ke bina */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Baaki saare pages MainLayout (Navbar ke saath) ke andar aayenge */}
      <Route element={<MainLayout />}>
        {/* PUBLIC - koi login nahi chahiye */}
        <Route path="/" element={<Home />} />
        {/* Explore aur Search dono asal me Home hi hai (query param se driven) -
            backend ka GET /videos ek hi endpoint search+listing dono handle karta hai,
            isliye alag-alag page banane se code duplicate hota, isliye reuse kiya */}
        <Route path="/explore" element={<Home />} />
        <Route path="/search" element={<Home />} />
        <Route path="/watch/:videoId" element={<Watch />} />
        <Route path="/channel/:username" element={<Channel />} />
        <Route path="/playlist/:playlistId" element={<Playlist />} />

        {/* PROTECTED - login required, warna ProtectedRoute /login par bhej dega */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadVideo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:videoId"
          element={
            <ProtectedRoute>
              <EditVideo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

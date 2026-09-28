import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

// Ye layout un saare pages ko wrap karega jinme Navbar dikhna chahiye
// (Login/Register jaise pages iska use nahi karenge - unka apna full-screen layout hai)
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

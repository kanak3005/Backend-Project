import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

// Ye layout un saare pages ko wrap karega jinme Navbar dikhna chahiye
// (Login/Register jaise pages iska use nahi karenge - unka apna full-screen layout hai)
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main>
        <Outlet /> {/* Yahan par matching child route ka page render hoga */}
      </main>
    </div>
  );
}

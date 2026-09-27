import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Upload, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("query") || "");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    // Real backend search - navigate karke Home/Search page ko query param ke through data fetch karwate hai
    navigate(trimmed ? `/search?query=${encodeURIComponent(trimmed)}` : "/search");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-surface-border bg-surface/90 px-4 backdrop-blur">
      <Link to="/" className="shrink-0 text-xl font-extrabold tracking-tight text-white">
        Vuelo
      </Link>

      <form
        onSubmit={handleSearchSubmit}
        className="mx-2 flex max-w-md flex-1 items-center rounded-full border border-surface-border bg-surface-card px-4 py-2"
      >
        <Search size={16} className="mr-2 shrink-0 text-gray-500" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search videos"
          className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
        />
      </form>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {isAuthenticated ? (
          <>
            <Link
              to="/upload"
              className="hidden items-center gap-1.5 rounded-full border border-surface-border px-3 py-1.5 text-sm text-gray-200 hover:border-brand-500 sm:flex"
            >
              <Upload size={16} /> Upload
            </Link>
            <div className="relative">
              <button onClick={() => setMenuOpen((o) => !o)} className="block">
                <img
                  src={user?.avatar}
                  alt={user?.username}
                  className="h-8 w-8 rounded-full border border-surface-border object-cover"
                />
              </button>
              {menuOpen && (
                <>
                  {/* backdrop to close menu on outside click */}
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-surface-border bg-surface-card p-1.5 shadow-xl">
                    <Link
                      to={`/channel/${user?.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-gray-200 hover:bg-surface-hover"
                    >
                      Your channel
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-200 hover:bg-surface-hover"
                    >
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link
                      to="/upload"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-200 hover:bg-surface-hover sm:hidden"
                    >
                      <Upload size={15} /> Upload
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-surface-hover"
                    >
                      <LogOut size={15} /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="rounded-full px-3 py-1.5 text-sm text-gray-200 hover:bg-surface-hover sm:px-4"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600 sm:px-4"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

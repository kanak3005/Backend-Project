import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Upload, LayoutDashboard, LogOut, Settings, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("query") || "");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setSearchInput(searchParams.get("query") || "");
  }, [searchParams]);

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
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-white/[0.07] bg-surface/90 px-4 backdrop-blur-xl sm:px-6">
      <Link to="/" className="flex shrink-0 items-center gap-2 text-xl font-extrabold tracking-tight text-white">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-sm shadow-lg shadow-brand-900/40">V</span>
        <span className="hidden sm:inline">Vuelo</span>
      </Link>

      <form
        onSubmit={handleSearchSubmit}
        className="mx-2 flex max-w-xl flex-1 items-center rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-2.5 transition focus-within:border-brand-500/70 focus-within:bg-surface-card sm:mx-8 sm:px-4"
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
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-400 sm:px-4"
            >
              <Upload size={16} /> <span className="hidden sm:inline">Upload</span>
            </Link>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Open profile menu"
                aria-expanded={menuOpen}
                className="block rounded-full ring-2 ring-transparent transition hover:ring-brand-400/60"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.username}
                    className="h-9 w-9 rounded-full border border-white/10 object-cover"
                  />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-surface-hover text-gray-300">
                    <UserRound size={17} />
                  </span>
                )}
              </button>
              {menuOpen && (
                <>
                  {/* backdrop to close menu on outside click */}
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-52 rounded-2xl border border-white/10 bg-surface-card p-1.5 shadow-2xl shadow-black/40">
                    <Link
                      to={`/channel/${user?.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm text-gray-200 hover:bg-surface-hover"
                    >
                      Your channel
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-200 hover:bg-surface-hover"
                    >
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-200 hover:bg-surface-hover"
                    >
                      <Settings size={15} /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-400 hover:bg-surface-hover"
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
              className="rounded-xl px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-surface-hover hover:text-white sm:px-4"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 sm:px-4"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

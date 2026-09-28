import { Link, useLocation } from "react-router-dom";
import {
  Bookmark,
  Compass,
  History,
  House,
  Settings,
  ThumbsUp,
  Video,
  UsersRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { label: "Home", icon: House, to: "/" },
  { label: "Explore", icon: Compass, to: "/explore" },
  { label: "Liked videos", mobileLabel: "Liked", icon: ThumbsUp, tab: "liked" },
  { label: "History", icon: History, tab: "history" },
  { label: "My content", icon: Video, tab: "videos" },
  { label: "Playlists", icon: Bookmark, tab: "playlists" },
  { label: "Subscriptions", mobileLabel: "Subs", icon: UsersRound, tab: "subscriptions" },
];

function SidebarLink({ item, mobile = false }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const to = item.tab
    ? isAuthenticated
      ? `/dashboard?tab=${item.tab}`
      : "/login"
    : item.to;
  const selected = item.tab
    ? location.pathname === "/dashboard" &&
      (new URLSearchParams(location.search).get("tab") || "videos") === item.tab
    : item.to === "/"
      ? location.pathname === "/"
      : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
  const Icon = item.icon;

  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        selected
          ? "bg-brand-500/15 text-brand-200"
          : "text-gray-400 hover:bg-surface-hover hover:text-white"
      } ${mobile ? "min-w-0 flex-1 flex-col gap-1 px-1 py-2 text-[10px]" : ""}`}
      aria-current={selected ? "page" : undefined}
    >
      <Icon size={mobile ? 19 : 18} strokeWidth={selected ? 2.3 : 1.8} />
      <span className={mobile ? "block max-w-full truncate text-center" : ""}>
        {mobile ? item.mobileLabel || item.label : item.label}
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-surface-border/80 bg-surface/75 px-3 py-5 lg:flex">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">
          Discover
        </p>
        <nav className="space-y-1">
          {navigation.slice(0, 2).map((item) => (
            <SidebarLink key={item.label} item={item} />
          ))}
        </nav>

        <div className="my-4 border-t border-surface-border/80" />
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">
          Your library
        </p>
        <nav className="space-y-1">
          {navigation.slice(2).map((item) => (
            <SidebarLink key={item.label} item={item} />
          ))}
        </nav>

        {isAuthenticated && (
          <Link
            to="/settings"
            className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-surface-hover hover:text-white"
          >
            <Settings size={18} strokeWidth={1.8} />
            Settings
          </Link>
        )}
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-surface-border bg-surface/95 px-2 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-1 backdrop-blur-lg lg:hidden">
        {[navigation[0], navigation[2], navigation[3], navigation[5], navigation[6]].map((item) => (
          <SidebarLink key={item.label} item={item} mobile />
        ))}
      </nav>
    </>
  );
}

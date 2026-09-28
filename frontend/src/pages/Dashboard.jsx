import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Bookmark,
  History,
  Pencil,
  ThumbsUp,
  UsersRound,
  Video as VideoIcon,
} from "lucide-react";
import { getChannelStats, getChannelVideos } from "../api/dashboard.api";
import { getLikedVideos } from "../api/like.api";
import { getWatchHistory } from "../api/auth.api";
import { createPlaylist, getUserPlaylists } from "../api/playlist.api";
import { getSubscribedChannels } from "../api/subscription.api";
import VideoGrid from "../components/VideoGrid";
import { formatCount } from "../utils/formatters";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const TABS = [
  { id: "videos", label: "My videos", icon: VideoIcon },
  { id: "liked", label: "Liked videos", icon: ThumbsUp },
  { id: "history", label: "Watch history", icon: History },
  { id: "playlists", label: "Playlists", icon: Bookmark },
  { id: "subscriptions", label: "Subscriptions", icon: UsersRound },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const requested = searchParams.get("tab");
    return TABS.some((tab) => tab.id === requested) ? requested : "videos";
  });
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState(null);
  const [likedVideos, setLikedVideos] = useState(null);
  const [historyVideos, setHistoryVideos] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [subscriptions, setSubscriptions] = useState(null);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getChannelStats()
      .then((response) => setStats(response.data.data))
      .catch((err) => showToast(err?.response?.data?.message || "Could not load channel stats.", "error"));
  }, [showToast]);

  useEffect(() => {
    const requested = searchParams.get("tab");
    if (TABS.some((tab) => tab.id === requested) && requested !== activeTab) {
      setActiveTab(requested);
    }
  }, [activeTab, searchParams]);

  useEffect(() => {
    loadTab(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?._id]);

  const loadTab = async (tab) => {
    setIsLoading(true);
    setError("");
    try {
      if (tab === "videos" && videos === null) {
        const response = await getChannelVideos();
        setVideos(response.data.data);
      } else if (tab === "liked" && likedVideos === null) {
        const response = await getLikedVideos();
        setLikedVideos(response.data.data.map((like) => like.video).filter(Boolean));
      } else if (tab === "history" && historyVideos === null) {
        const response = await getWatchHistory();
        const data = response.data?.data;
        if (!Array.isArray(data)) {
          throw new Error("Watch history service returned an unexpected response.");
        }
        setHistoryVideos(data);
      } else if (tab === "playlists" && playlists === null) {
        const response = await getUserPlaylists(user._id);
        setPlaylists(response.data.data);
      } else if (tab === "subscriptions" && subscriptions === null) {
        const response = await getSubscribedChannels(user._id);
        setSubscriptions(response.data.data.map((entry) => entry.channel).filter(Boolean));
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load this data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleCreatePlaylist = async (event) => {
    event.preventDefault();
    if (!playlistName.trim()) return;
    setIsCreatingPlaylist(true);
    try {
      const response = await createPlaylist({
        name: playlistName.trim(),
        description: playlistDescription.trim(),
      });
      setPlaylists((current) => [response.data.data, ...(current || [])]);
      setPlaylistName("");
      setPlaylistDescription("");
      showToast("Playlist created.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not create playlist.", "error");
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const activeList = { videos, liked: likedVideos, history: historyVideos }[activeTab];

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Your studio</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Dashboard</h1>

      {stats && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Videos" value={stats.totalVideos} />
          <StatCard label="Total views" value={formatCount(stats.totalViews)} />
          <StatCard label="Subscribers" value={formatCount(stats.totalSubscribers)} />
          <StatCard label="Total likes" value={formatCount(stats.totalLikes)} />
        </div>
      )}

      <div className="mt-7 flex gap-1 overflow-x-auto border-b border-surface-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === tab.id
                ? "border-brand-500 text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "videos" && videos?.length > 0 && (
          <div className="mb-4 flex justify-end">
            <Link to="/upload" className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400">
              Upload new video
            </Link>
          </div>
        )}
        {activeTab === "videos" && !isLoading && videos ? (
          <MyVideosGrid videos={videos} />
        ) : activeTab === "playlists" ? (
          <div className="space-y-5">
            <form onSubmit={handleCreatePlaylist} className="grid gap-3 rounded-2xl border border-white/[0.07] bg-surface-card p-4 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end">
              <label className="text-xs font-medium text-gray-400">
                Playlist name
                <input
                  value={playlistName}
                  onChange={(event) => setPlaylistName(event.target.value)}
                  maxLength={80}
                  required
                  placeholder="Give your collection a name"
                  className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-surface px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
                />
              </label>
              <label className="text-xs font-medium text-gray-400">
                Description
                <input
                  value={playlistDescription}
                  onChange={(event) => setPlaylistDescription(event.target.value)}
                  maxLength={300}
                  placeholder="Optional"
                  className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-surface px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
                />
              </label>
              <button
                disabled={isCreatingPlaylist || !playlistName.trim()}
                className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-50"
              >
                {isCreatingPlaylist ? "Creating..." : "Create playlist"}
              </button>
            </form>
            {isLoading ? (
              <PlaylistSkeletons />
            ) : error ? (
              <ErrorMessage message={error} onRetry={() => loadTab(activeTab)} />
            ) : playlists?.length ? (
              <PlaylistGrid playlists={playlists} />
            ) : (
              <EmptyMessage>You haven't created any playlists yet.</EmptyMessage>
            )}
          </div>
        ) : activeTab === "subscriptions" ? (
          isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-surface-card" />)}
            </div>
          ) : error ? (
            <ErrorMessage message={error} onRetry={() => loadTab(activeTab)} />
          ) : subscriptions?.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {subscriptions.map((channel) => (
                <Link key={channel._id} to={`/channel/${channel.username}`} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-surface-card p-4 transition hover:border-brand-500/40">
                  <img src={channel.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">{channel.fullname || channel.username}</span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500">@{channel.username}</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyMessage>You aren't following any channels yet.</EmptyMessage>
          )
        ) : (
          <VideoGrid
            videos={activeList}
            isLoading={isLoading}
            error={error}
            onRetry={() => loadTab(activeTab)}
            emptyMessage={
              activeTab === "liked"
                ? "Videos you like will show up here."
                : activeTab === "history"
                  ? "Videos you watch will show up here."
                  : "You haven't uploaded any videos yet."
            }
          />
        )}
      </div>
    </div>
  );
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
      {message}
      <button onClick={onRetry} className="ml-3 font-semibold underline underline-offset-2">Retry</button>
    </div>
  );
}

function EmptyMessage({ children }) {
  return <div className="rounded-2xl border border-dashed border-surface-border py-14 text-center text-sm text-gray-500">{children}</div>;
}

function PlaylistSkeletons() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl bg-surface-card" />)}</div>;
}

function PlaylistGrid({ playlists }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {playlists.map((playlist) => (
        <Link key={playlist._id} to={`/playlist/${playlist._id}`} className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-surface-card transition hover:-translate-y-0.5 hover:border-brand-500/40">
          <div className="relative grid aspect-[2.4/1] grid-cols-3 gap-1 bg-gradient-to-br from-brand-900/60 to-surface-hover p-1">
            {playlist.videos?.slice(0, 3).map((video, index) => (
              <img key={video._id || index} src={video.thumbnail} alt="" className="h-full w-full rounded-lg object-cover" />
            ))}
            <span className="absolute bottom-2 right-2 rounded-lg bg-black/75 px-2 py-1 text-xs text-white">
              {playlist.videos?.length || 0} videos
            </span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-white group-hover:text-brand-200">{playlist.name}</h3>
            {playlist.description && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{playlist.description}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-surface-card p-4">
      <div className="flex items-center gap-1.5 text-xs text-gray-500"><BarChart3 size={12} /> {label}</div>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function MyVideosGrid({ videos }) {
  if (videos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-border py-16 text-center">
        <p className="text-gray-400">You haven't uploaded any videos yet.</p>
        <Link to="/upload" className="mt-3 inline-block rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-400">
          Upload your first video
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {videos.map((video) => (
        <div key={video._id} className="group relative">
          <Link to={`/watch/${video._id}`} className="block">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-card">
              <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
              {!video.isPublished && <span className="absolute left-2 top-2 rounded-md bg-black/80 px-2 py-1 text-[10px] font-medium text-yellow-300">Unpublished</span>}
            </div>
            <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-gray-100">{video.title}</h3>
            <p className="text-xs text-gray-500">{formatCount(video.views)} views</p>
          </Link>
          <Link to={`/edit/${video._id}`} className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
            <Pencil size={12} /> Edit
          </Link>
        </div>
      ))}
    </div>
  );
}

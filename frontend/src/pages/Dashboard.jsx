import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Video as VideoIcon, ThumbsUp, History, BarChart3 } from "lucide-react";
import { getChannelStats, getChannelVideos } from "../api/dashboard.api";
import { getLikedVideos } from "../api/like.api";
import { getWatchHistory } from "../api/auth.api";
import VideoGrid from "../components/VideoGrid";
import { formatCount } from "../utils/formatters";

const TABS = [
  { id: "videos", label: "My videos", icon: VideoIcon },
  { id: "liked", label: "Liked videos", icon: ThumbsUp },
  { id: "history", label: "Watch history", icon: History },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("videos");
  const [stats, setStats] = useState(null);

  const [videos, setVideos] = useState(null);
  const [likedVideos, setLikedVideos] = useState(null);
  const [historyVideos, setHistoryVideos] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getChannelStats()
      .then((res) => setStats(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadTab(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadTab = async (tab) => {
    setIsLoading(true);
    setError("");
    try {
      if (tab === "videos" && videos === null) {
        const res = await getChannelVideos();
        setVideos(res.data.data);
      } else if (tab === "liked" && likedVideos === null) {
        const res = await getLikedVideos();
        // Like documents ka "video" field nikal ke VideoCard-compatible list banate hai
        setLikedVideos(res.data.data.map((like) => like.video).filter(Boolean));
      } else if (tab === "history" && historyVideos === null) {
        const res = await getWatchHistory();
        setHistoryVideos(res.data.data || []);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load this data.");
    } finally {
      setIsLoading(false);
    }
  };

  const activeList = { videos, liked: likedVideos, history: historyVideos }[activeTab];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="text-xl font-bold text-white">Dashboard</h1>

      {/* Stats cards */}
      {stats && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Videos" value={stats.totalVideos} />
          <StatCard label="Total views" value={formatCount(stats.totalViews)} />
          <StatCard label="Subscribers" value={formatCount(stats.totalSubscribers)} />
          <StatCard label="Total likes" value={formatCount(stats.totalLikes)} />
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-surface-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
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
        {activeTab === "videos" && videos && videos.length > 0 && (
          <div className="mb-4 flex justify-end">
            <Link
              to="/upload"
              className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              Upload new video
            </Link>
          </div>
        )}

        {activeTab === "videos" && !isLoading && videos ? (
          <MyVideosGrid videos={videos} />
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-4">
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <BarChart3 size={12} /> {label}
      </div>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
    </div>
  );
}

// My-videos grid has an Edit overlay + shows publish status, unlike the plain public grid
function MyVideosGrid({ videos }) {
  if (videos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-border py-16 text-center">
        <p className="text-gray-400">You haven't uploaded any videos yet.</p>
        <Link
          to="/upload"
          className="mt-3 inline-block rounded-full bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Upload your first video
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <div key={video._id} className="group relative">
          <Link to={`/watch/${video._id}`} className="block">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface-card">
              <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
              {!video.isPublished && (
                <span className="absolute left-1.5 top-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-yellow-400">
                  Unpublished
                </span>
              )}
            </div>
            <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-gray-100">{video.title}</h3>
            <p className="text-xs text-gray-500">{formatCount(video.views)} views</p>
          </Link>
          <Link
            to={`/edit/${video._id}`}
            className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
          >
            <Pencil size={12} /> Edit
          </Link>
        </div>
      ))}
    </div>
  );
}

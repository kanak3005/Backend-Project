import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPlaylistById } from "../api/playlist.api";
import ErrorState from "../components/ErrorState";
import VideoGrid from "../components/VideoGrid";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { Bookmark } from "lucide-react";
import { formatRelativeTime } from "../utils/formatters";

export default function Playlist() {
  const { playlistId } = useParams();
  const { isAuthenticated } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPlaylist = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getPlaylistById(playlistId);
      const data = response.data?.data;
      if (!data?._id || !Array.isArray(data.videos)) {
        throw new Error("Playlist service returned an unexpected response.");
      }
      setPlaylist(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load this playlist.");
    } finally {
      setIsLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPlaylist();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadPlaylist]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          icon={Bookmark}
          title="Sign in to open this playlist"
          description="The current playlist API is available to authenticated viewers."
        />
        <div className="mt-4 text-center">
          <Link to="/login" state={{ from: { pathname: window.location.pathname } }} className="text-sm font-semibold text-brand-300 hover:text-brand-200">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState message={error} onRetry={loadPlaylist} />
      </div>
    );
  }

  if (isLoading || !playlist) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-5 py-10 sm:px-8">
        <div className="h-40 rounded-3xl bg-surface-card" />
        <div className="mt-8 h-4 w-1/3 rounded bg-surface-card" />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-8 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-brand-900/40 via-surface-card to-surface-card p-6 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
          Playlist · {playlist.videos?.length || 0} videos
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {playlist.name}
        </h1>
        {playlist.description && (
          <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-gray-400">
            {playlist.description}
          </p>
        )}
        {playlist.owner && (
          <Link
            to={`/channel/${playlist.owner.username}`}
            className="mt-5 inline-flex items-center gap-2 text-sm text-gray-300 transition hover:text-white"
          >
            <img
              src={playlist.owner.avatar}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
            {playlist.owner.fullname || playlist.owner.username}
            <span className="text-gray-600">·</span>
            Updated {formatRelativeTime(playlist.updatedAt || playlist.createdAt)}
          </Link>
        )}
      </div>
      <VideoGrid
        videos={playlist.videos || []}
        isLoading={false}
        error=""
        onRetry={loadPlaylist}
        emptyMessage="Add videos to this playlist to see them here."
      />
    </section>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getVideoById, getAllVideos } from "../api/video.api";
import { getUserChannelProfile } from "../api/auth.api";
import { addVideoToPlaylist, getUserPlaylists } from "../api/playlist.api";
import LikeButton from "../components/LikeButton";
import SubscribeButton from "../components/SubscribeButton";
import CommentSection from "../components/CommentSection";
import RelatedVideoCard from "../components/RelatedVideoCard";
import ErrorState from "../components/ErrorState";
import { formatCount, formatRelativeTime } from "../utils/formatters";
import { BookmarkPlus, Check, Share2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Watch() {
  const { videoId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [channel, setChannel] = useState(null); // extra channel info (subscribersCount, isSubscribed)
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [relatedError, setRelatedError] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playlistMenuOpen, setPlaylistMenuOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [savingPlaylistId, setSavingPlaylistId] = useState("");
  const [savedPlaylistIds, setSavedPlaylistIds] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setChannel(null);
    setRelatedVideos([]);
    setRelatedError("");
    setSavedPlaylistIds([]);
    fetchVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const fetchVideo = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Public endpoint - real videoFile URL Cloudinary se aati hai
      const videoResponse = await getVideoById(videoId);
      const fetchedVideo = videoResponse.data.data;
      if (!fetchedVideo?._id || !fetchedVideo.videoFile) {
        throw new Error("Video service returned an unexpected response.");
      }
      setVideo(fetchedVideo);

      // Channel ki subscribersCount/isSubscribed nikalne ke liye - ye getVideoById
      // me nahi milta, isliye channel profile alag se fetch karte hai
      if (fetchedVideo.owner?.username) {
        getUserChannelProfile(fetchedVideo.owner.username)
          .then((res) => setChannel(res.data.data))
          .catch((err) => {
            setChannel(null);
            showToast(err?.response?.data?.message || "Could not load channel details.", "error");
          });
      }

      // "More videos" - backend me koi personalized "related videos" algorithm nahi hai,
      // isliye hum sirf latest published videos dikha rahe hai (current video ke bina)
      try {
        const relatedResponse = await getAllVideos({ limit: 10 });
        const docs = relatedResponse.data?.data?.docs;
        if (!Array.isArray(docs)) {
          throw new Error("Video service returned an unexpected response.");
        }
        setRelatedVideos(docs.filter((v) => v._id !== videoId));
      } catch (err) {
        setRelatedError(err?.response?.data?.message || "Could not load more videos.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "This video could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Could not copy the video link.", "error");
    }
  };

  const handleOpenPlaylistMenu = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    if (playlistMenuOpen) {
      setPlaylistMenuOpen(false);
      return;
    }
    setPlaylistMenuOpen(true);
    setIsLoadingPlaylists(true);
    try {
      const response = await getUserPlaylists(user._id);
      setPlaylists(response.data.data);
    } catch (err) {
      setPlaylistMenuOpen(false);
      showToast(err?.response?.data?.message || "Could not load your playlists.", "error");
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    setSavingPlaylistId(playlistId);
    try {
      await addVideoToPlaylist(video._id, playlistId);
      setSavedPlaylistIds((current) => [...new Set([...current, playlistId])]);
      showToast("Added to playlist.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not add video to playlist.", "error");
    } finally {
      setSavingPlaylistId("");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="aspect-video w-full animate-pulse rounded-xl bg-surface-card" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState message={error || "Video not found."} onRetry={fetchVideo} />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1600px] gap-8 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-10">
      <div className="min-w-0">
        {/* Video Player - real Cloudinary videoFile URL, no fake data */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/30 ring-1 ring-white/[0.06]">
          <video
            key={video._id}
            src={video.videoFile}
            controls
            poster={video.thumbnail}
            className="h-full w-full object-contain"
          />
        </div>

        <h1 className="mt-5 text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">{video.title}</h1>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Link to={`/channel/${video.owner?.username}`} className="flex items-center gap-3">
            <img
              src={video.owner?.avatar}
              alt={video.owner?.username}
              className="h-11 w-11 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-gray-100">{video.owner?.fullname}</p>
              <p className="text-xs text-gray-500">@{video.owner?.username}</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {channel && (
              <SubscribeButton
                channelId={channel._id}
                initialIsSubscribed={channel.isSubscribed}
                initialSubscribersCount={channel.subscribersCount}
              />
            )}
            <LikeButton videoId={video._id} />
            <div className="relative">
              <button
                onClick={handleOpenPlaylistMenu}
                aria-expanded={playlistMenuOpen}
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3.5 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-brand-500/70 hover:bg-white/[0.03]"
              >
                <BookmarkPlus size={16} /> Save
              </button>
              {playlistMenuOpen && (
                <>
                  <button
                    aria-label="Close playlist menu"
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setPlaylistMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-white/10 bg-surface-card p-2 shadow-2xl">
                    <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Save to playlist</p>
                    {isLoadingPlaylists ? (
                      <p className="px-2 py-3 text-sm text-gray-500">Loading playlists...</p>
                    ) : playlists.length === 0 ? (
                      <div className="px-2 py-2">
                        <p className="text-sm text-gray-400">You don't have a playlist yet.</p>
                        <Link to="/dashboard?tab=playlists" onClick={() => setPlaylistMenuOpen(false)} className="mt-2 inline-block text-sm font-semibold text-brand-300 hover:text-brand-200">
                          Create one
                        </Link>
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        {playlists.map((playlist) => {
                          const isSaved = savedPlaylistIds.includes(playlist._id);
                          return (
                            <button
                              key={playlist._id}
                              onClick={() => handleAddToPlaylist(playlist._id)}
                              disabled={isSaved || !!savingPlaylistId}
                              className="flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-left text-sm text-gray-200 transition hover:bg-surface-hover disabled:opacity-60"
                            >
                              <span className="truncate">{playlist.name}</span>
                              {isSaved ? <Check size={15} className="text-emerald-400" /> : savingPlaylistId === playlist._id ? <span className="text-xs text-gray-500">Saving...</span> : null}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3.5 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-brand-500/70"
            >
              <Share2 size={16} /> {copied ? "Copied!" : "Share"}
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/[0.07] bg-surface-card p-4 sm:p-5">
          <p className="text-xs font-medium text-gray-400">
            {formatCount(video.views)} views • {formatRelativeTime(video.createdAt)}
          </p>
          <p
            className={`mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-300 ${
              showFullDescription ? "" : "line-clamp-3"
            }`}
          >
            {video.description}
          </p>
          {video.description?.length > 150 && (
            <button
              onClick={() => setShowFullDescription((s) => !s)}
              className="mt-1 text-xs font-medium text-gray-400 hover:text-white"
            >
              {showFullDescription ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        <div className="mt-6 border-t border-surface-border pt-6">
          <CommentSection videoId={video._id} />
        </div>
      </div>

      {/* More videos sidebar */}
      <div className="space-y-3 lg:pt-1">
        <h3 className="mb-4 text-sm font-semibold text-white">More to watch</h3>
        {relatedError ? (
          <p className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">{relatedError}</p>
        ) : null}
        {relatedVideos.map((v) => (
          <RelatedVideoCard key={v._id} video={v} />
        ))}
      </div>
    </div>
  );
}
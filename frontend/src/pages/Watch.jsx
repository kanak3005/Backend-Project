import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getVideoById, getAllVideos } from "../api/video.api";
import { getUserChannelProfile } from "../api/auth.api";
import LikeButton from "../components/LikeButton";
import SubscribeButton from "../components/SubscribeButton";
import CommentSection from "../components/CommentSection";
import RelatedVideoCard from "../components/RelatedVideoCard";
import ErrorState from "../components/ErrorState";
import { formatCount, formatRelativeTime } from "../utils/formatters";
import { Share2 } from "lucide-react";

export default function Watch() {
  const { videoId } = useParams();

  const [video, setVideo] = useState(null);
  const [channel, setChannel] = useState(null); // extra channel info (subscribersCount, isSubscribed)
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
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
      setVideo(fetchedVideo);

      // Channel ki subscribersCount/isSubscribed nikalne ke liye - ye getVideoById
      // me nahi milta, isliye channel profile alag se fetch karte hai
      if (fetchedVideo.owner?.username) {
        getUserChannelProfile(fetchedVideo.owner.username)
          .then((res) => setChannel(res.data.data))
          .catch(() => setChannel(null));
      }

      // "More videos" - backend me koi personalized "related videos" algorithm nahi hai,
      // isliye hum sirf latest published videos dikha rahe hai (current video ke bina)
      getAllVideos({ limit: 10 })
        .then((res) => setRelatedVideos(res.data.data.docs.filter((v) => v._id !== videoId)))
        .catch(() => {});
    } catch (err) {
      setError(err?.response?.data?.message || "This video could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
      <div>
        {/* Video Player - real Cloudinary videoFile URL, no fake data */}
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <video
            key={video._id}
            src={video.videoFile}
            controls
            className="h-full w-full"
          />
        </div>

        <h1 className="mt-4 text-lg font-bold text-white sm:text-xl">{video.title}</h1>

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

          <div className="flex items-center gap-2">
            {channel && (
              <SubscribeButton
                channelId={channel._id}
                initialIsSubscribed={channel.isSubscribed}
                initialSubscribersCount={channel.subscribersCount}
              />
            )}
            <LikeButton videoId={video._id} />
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-full border border-surface-border px-4 py-2 text-sm text-gray-200 hover:border-brand-500"
            >
              <Share2 size={16} /> {copied ? "Copied!" : "Share"}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-surface-card p-4">
          <p className="text-sm text-gray-400">
            {formatCount(video.views)} views • {formatRelativeTime(video.createdAt)}
          </p>
          <p
            className={`mt-2 whitespace-pre-wrap text-sm text-gray-300 ${
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
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400">More videos</h3>
        {relatedVideos.map((v) => (
          <RelatedVideoCard key={v._id} video={v} />
        ))}
      </div>
    </div>
  );
}
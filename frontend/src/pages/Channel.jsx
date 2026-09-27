import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserChannelProfile } from "../api/auth.api";
import { getAllVideos } from "../api/video.api";
import SubscribeButton from "../components/SubscribeButton";
import VideoGrid from "../components/VideoGrid";
import ErrorState from "../components/ErrorState";

export default function Channel() {
  const { username } = useParams();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isLoadingChannel, setIsLoadingChannel] = useState(true);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [error, setError] = useState("");
  const [videosError, setVideosError] = useState("");

  useEffect(() => {
    fetchChannel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const fetchChannel = async () => {
    setIsLoadingChannel(true);
    setError("");
    try {
      // Public endpoint - logged-out visitors bhi channel profile dekh sakte hai
      const response = await getUserChannelProfile(username);
      const channelData = response.data.data;
      setChannel(channelData);
      fetchVideos(channelData._id);
    } catch (err) {
      setError(err?.response?.data?.message || "This channel could not be found.");
    } finally {
      setIsLoadingChannel(false);
    }
  };

  const fetchVideos = async (channelId) => {
    setIsLoadingVideos(true);
    setVideosError("");
    try {
      // GET /videos?userId=... - public, sirf isi channel ke videos filter karte hai
      const response = await getAllVideos({ userId: channelId, limit: 24 });
      setVideos(response.data.data.docs);
    } catch (err) {
      setVideosError(err?.response?.data?.message || "Could not load this channel's videos.");
    } finally {
      setIsLoadingVideos(false);
    }
  };

  if (isLoadingChannel) {
    return (
      <div className="animate-pulse">
        <div className="h-40 w-full bg-surface-card sm:h-56" />
        <div className="mx-auto max-w-7xl px-4">
          <div className="-mt-10 h-24 w-24 rounded-full border-4 border-surface bg-surface-card" />
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState message={error || "Channel not found."} onRetry={fetchChannel} />
      </div>
    );
  }

  return (
    <div>
      {/* Cover banner - backend field is a plain image URL, or blank if none set */}
      <div className="h-32 w-full bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 sm:h-48">
        {channel.coverImage && (
          <img src={channel.coverImage} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="-mt-10 flex flex-wrap items-end justify-between gap-4 sm:-mt-12">
          <div className="flex items-end gap-4">
            <img
              src={channel.avatar}
              alt={channel.username}
              className="h-20 w-20 rounded-full border-4 border-surface object-cover sm:h-28 sm:w-28"
            />
            <div className="pb-1">
              <h1 className="text-lg font-bold text-white sm:text-2xl">{channel.fullname}</h1>
              <p className="text-sm text-gray-400">
                @{channel.username} • {channel.subscribersCount} subscribers
              </p>
            </div>
          </div>
          <div className="pb-1">
            <SubscribeButton
              channelId={channel._id}
              initialIsSubscribed={channel.isSubscribed}
              initialSubscribersCount={channel.subscribersCount}
            />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-gray-400">Videos</h2>
          <VideoGrid
            videos={videos}
            isLoading={isLoadingVideos}
            error={videosError}
            onRetry={() => fetchVideos(channel._id)}
            emptyMessage="This channel hasn't uploaded any videos yet."
          />
        </div>
      </div>
    </div>
  );
}

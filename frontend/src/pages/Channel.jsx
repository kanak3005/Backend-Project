import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bookmark, MessageSquareText, Video as VideoIcon } from "lucide-react";
import { getUserChannelProfile } from "../api/auth.api";
import { getAllVideos } from "../api/video.api";
import { getUserPlaylists } from "../api/playlist.api";
import { createTweet, deleteTweet, getUserTweets } from "../api/tweet.api";
import SubscribeButton from "../components/SubscribeButton";
import VideoGrid from "../components/VideoGrid";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatRelativeTime } from "../utils/formatters";

const TABS = [
  { id: "videos", label: "Videos", icon: VideoIcon },
  { id: "playlists", label: "Playlists", icon: Bookmark },
  { id: "tweets", label: "Tweets", icon: MessageSquareText },
];

export default function Channel() {
  const { username } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [activeTab, setActiveTab] = useState("videos");
  const [tweetContent, setTweetContent] = useState("");
  const [isLoadingChannel, setIsLoadingChannel] = useState(true);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isLoadingTweets, setIsLoadingTweets] = useState(false);
  const [isPostingTweet, setIsPostingTweet] = useState(false);
  const [error, setError] = useState("");
  const [videosError, setVideosError] = useState("");
  const [playlistsError, setPlaylistsError] = useState("");
  const [tweetsError, setTweetsError] = useState("");

  const fetchVideos = useCallback(async (channelId) => {
    setIsLoadingVideos(true);
    setVideosError("");
    try {
      const response = await getAllVideos({ userId: channelId, limit: 24 });
      const docs = response.data?.data?.docs;
      if (!Array.isArray(docs)) {
        throw new Error("Video service returned an unexpected response.");
      }
      setVideos(docs);
    } catch (err) {
      setVideosError(err?.response?.data?.message || "Could not load this channel's videos.");
    } finally {
      setIsLoadingVideos(false);
    }
  }, []);

  const fetchChannel = useCallback(async () => {
    setIsLoadingChannel(true);
    setError("");
    setChannel(null);
    setVideos([]);
    setPlaylists([]);
    setTweets([]);
    setPlaylistsError("");
    setTweetsError("");
    setActiveTab("videos");
    try {
      const response = await getUserChannelProfile(username);
      const channelData = response.data?.data;
      if (!channelData?._id) {
        throw new Error("Channel service returned an unexpected response.");
      }
      setChannel(channelData);
      await fetchVideos(channelData._id);
    } catch (err) {
      setError(err?.response?.data?.message || "This channel could not be found.");
      setIsLoadingVideos(false);
    } finally {
      setIsLoadingChannel(false);
    }
  }, [fetchVideos, username]);

  const fetchPlaylists = useCallback(async () => {
    if (!channel) return;
    setIsLoadingPlaylists(true);
    setPlaylistsError("");
    try {
      const response = await getUserPlaylists(channel._id);
      const data = response.data?.data;
      if (!Array.isArray(data)) {
        throw new Error("Playlist service returned an unexpected response.");
      }
      setPlaylists(data);
    } catch (err) {
      setPlaylistsError(err?.response?.data?.message || "Could not load this channel's playlists.");
    } finally {
      setIsLoadingPlaylists(false);
    }
  }, [channel]);

  const fetchTweets = useCallback(async () => {
    if (!channel) return;
    setIsLoadingTweets(true);
    setTweetsError("");
    try {
      const response = await getUserTweets(channel._id);
      const data = response.data?.data;
      if (!Array.isArray(data)) {
        throw new Error("Tweet service returned an unexpected response.");
      }
      setTweets(data);
    } catch (err) {
      setTweetsError(err?.response?.data?.message || "Could not load this channel's tweets.");
    } finally {
      setIsLoadingTweets(false);
    }
  }, [channel]);

  useEffect(() => {
    fetchChannel();
  }, [fetchChannel]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "playlists" && playlists.length === 0 && !playlistsError) {
      fetchPlaylists();
    }
    if (isAuthenticated && activeTab === "tweets" && tweets.length === 0 && !tweetsError) {
      fetchTweets();
    }
  }, [activeTab, fetchPlaylists, fetchTweets, isAuthenticated, playlists.length, tweets.length]);

  const handlePostTweet = async (event) => {
    event.preventDefault();
    if (!tweetContent.trim()) return;
    setIsPostingTweet(true);
    try {
      const response = await createTweet(tweetContent.trim());
      setTweets((current) => [response.data.data, ...current]);
      setTweetContent("");
      showToast("Post shared.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not post your tweet.", "error");
    } finally {
      setIsPostingTweet(false);
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    try {
      await deleteTweet(tweetId);
      setTweets((current) => current.filter((tweet) => tweet._id !== tweetId));
      showToast("Post deleted.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not delete this post.", "error");
    }
  };

  if (isLoadingChannel) {
    return (
      <div className="mx-auto max-w-[1400px] animate-pulse px-5 py-8 sm:px-8">
        <div className="h-40 rounded-3xl bg-surface-card sm:h-56" />
        <div className="mt-6 flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-surface-card sm:h-24 sm:w-24" />
          <div className="space-y-3">
            <div className="h-5 w-48 rounded bg-surface-card" />
            <div className="h-3 w-32 rounded bg-surface-card" />
          </div>
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

  const isOwnChannel = user?._id === channel._id;

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">
      <div className="relative h-36 overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-brand-900 via-[#36236c] to-[#11111c] sm:h-52">
        {channel.coverImage && (
          <img src={channel.coverImage} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-brand-950/20" />
        <div className="absolute bottom-5 left-6 hidden rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur sm:block">
          Creator space
        </div>
      </div>

      <section className="flex flex-wrap items-end justify-between gap-5 px-1 sm:px-4">
        <div className="flex min-w-0 items-end gap-4">
          <img
            src={channel.avatar}
            alt={channel.username}
            className="-mt-10 h-20 w-20 shrink-0 rounded-3xl border-4 border-surface object-cover shadow-xl sm:-mt-12 sm:h-28 sm:w-28"
          />
          <div className="min-w-0 pb-1">
            <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
              {channel.fullname || channel.username}
            </h1>
            <p className="mt-0.5 text-sm text-gray-400">@{channel.username}</p>
            <p className="mt-1.5 text-xs font-medium text-gray-500">
              {channel.subscribersCount || 0} subscribers
              {channel.channelSubscribedToCount > 0 && ` · ${channel.channelSubscribedToCount} following`}
            </p>
          </div>
        </div>
        <div className="pb-1">
          {!isOwnChannel && (
            <SubscribeButton
              channelId={channel._id}
              initialIsSubscribed={channel.isSubscribed}
              initialSubscribersCount={channel.subscribersCount}
            />
          )}
        </div>
      </section>

      <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-white/[0.08]" aria-label="Channel sections">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === id
                ? "border-brand-400 text-white"
                : "border-transparent text-gray-500 hover:text-gray-200"
            }`}
            aria-selected={activeTab === id}
            role="tab"
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>

      <div className="pt-6">
        {activeTab === "videos" && (
          <VideoGrid
            videos={videos}
            isLoading={isLoadingVideos}
            error={videosError}
            onRetry={() => fetchVideos(channel._id)}
            emptyMessage="This channel hasn't uploaded any videos yet."
          />
        )}

        {activeTab === "playlists" && (
          !isAuthenticated ? (
            <EmptyState
              icon={Bookmark}
              title="Sign in to view playlists"
              description="Playlist access is currently available to signed-in viewers."
            />
          ) : playlistsError ? (
            <ErrorState message={playlistsError} onRetry={fetchPlaylists} />
          ) : isLoadingPlaylists ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-48 animate-pulse rounded-2xl bg-surface-card" />
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <EmptyState icon={Bookmark} title="No playlists yet" description="This creator hasn't made a playlist yet." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {playlists.map((playlist) => (
                <Link
                  key={playlist._id}
                  to={`/playlist/${playlist._id}`}
                  className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-surface-card transition hover:-translate-y-0.5 hover:border-brand-500/40"
                >
                  <div className="relative grid aspect-[2.3/1] grid-cols-3 gap-1 overflow-hidden bg-gradient-to-br from-brand-900/60 to-surface-hover p-1">
                    {playlist.videos?.slice(0, 3).map((video, index) => (
                      <img key={video._id || index} src={video.thumbnail} alt="" className="h-full w-full rounded-lg object-cover" />
                    ))}
                    {playlist.videos?.length === 0 && (
                      <div className="col-span-3 grid place-items-center text-brand-200/70">
                        <Bookmark size={24} />
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 rounded-lg bg-black/75 px-2 py-1 text-xs text-white backdrop-blur">
                      {playlist.videos?.length || 0} videos
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white transition group-hover:text-brand-200">{playlist.name}</h3>
                    {playlist.description && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{playlist.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {activeTab === "tweets" && (
          !isAuthenticated ? (
            <EmptyState
              icon={MessageSquareText}
              title="Sign in to view posts"
              description="The current posts API requires an authenticated session."
            />
          ) : tweetsError ? (
            <ErrorState message={tweetsError} onRetry={fetchTweets} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {isOwnChannel && (
                <form onSubmit={handlePostTweet} className="rounded-2xl border border-white/[0.08] bg-surface-card p-4 sm:p-5">
                  <label htmlFor="channel-post" className="mb-3 block text-sm font-semibold text-white">
                    Share an update
                  </label>
                  <textarea
                    id="channel-post"
                    value={tweetContent}
                    onChange={(event) => setTweetContent(event.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="What's happening with your channel?"
                    className="w-full resize-y rounded-xl border border-white/[0.07] bg-surface px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-brand-500/70"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-600">{tweetContent.length}/500</span>
                    <button
                      type="submit"
                      disabled={isPostingTweet || !tweetContent.trim()}
                      className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPostingTweet ? "Posting..." : "Post update"}
                    </button>
                  </div>
                </form>
              )}

              {isLoadingTweets ? (
                <div className="space-y-3">
                  {[1, 2].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-surface-card" />)}
                </div>
              ) : tweets.length === 0 ? (
                <EmptyState icon={MessageSquareText} title="No posts yet" description="Channel updates will appear here." />
              ) : (
                tweets.map((tweet) => (
                  <article key={tweet._id} className="rounded-2xl border border-white/[0.07] bg-surface-card p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <img src={tweet.owner?.avatar || channel.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-semibold text-white">{tweet.owner?.fullname || tweet.owner?.username}</span>
                          <span className="text-xs text-gray-500">@{tweet.owner?.username}</span>
                          <span className="text-xs text-gray-600">· {formatRelativeTime(tweet.createdAt)}</span>
                          {user?._id === tweet.owner?._id && (
                            <button
                              onClick={() => handleDeleteTweet(tweet._id)}
                              className="ml-auto text-xs text-gray-500 transition hover:text-red-300"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-300">{tweet.content}</p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

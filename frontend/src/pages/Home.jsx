import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllVideos } from "../api/video.api";
import VideoGrid from "../components/VideoGrid";

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Newest", sortBy: "createdAt", sortType: "desc" },
  { value: "views-desc", label: "Most viewed", sortBy: "views", sortType: "desc" },
  { value: "createdAt-asc", label: "Oldest", sortBy: "createdAt", sortType: "asc" },
];

export default function Home() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // Jab bhi search query ya sort badle, page 1 se dobara start karo
  useEffect(() => {
    setPage(1);
    fetchVideos(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort]);

  const fetchVideos = async (pageToFetch, replace) => {
    if (replace) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError("");
    try {
      const sortOption = SORT_OPTIONS.find((s) => s.value === sort);
      // Backend ka actual GET /videos endpoint - koi fake data nahi
      const response = await getAllVideos({
        page: pageToFetch,
        limit: 12,
        query: query || undefined,
        sortBy: sortOption.sortBy,
        sortType: sortOption.sortType,
      });
      const data = response.data?.data; // mongoose-aggregate-paginate-v2 ka shape: { docs, hasNextPage, ... }
      if (!Array.isArray(data?.docs)) {
        throw new Error("Video service returned an unexpected response.");
      }
      setVideos((prev) => (replace ? data.docs : [...prev, ...data.docs]));
      setHasNextPage(data.hasNextPage);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load videos. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchVideos(nextPage, false);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
            {query ? "Search" : "Your next favorite"}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {query ? `Results for "${query}"` : "Recommended"}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {query ? "Videos matching your search" : "Discover videos from the Vuelo community"}
          </p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort videos"
          className="rounded-xl border border-white/[0.08] bg-surface-card px-3.5 py-2.5 text-sm text-gray-200 outline-none transition focus:border-brand-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <VideoGrid
        videos={videos}
        isLoading={isLoading}
        error={error}
        onRetry={() => fetchVideos(1, true)}
        emptyMessage={query ? "Try a different search term." : "No videos have been uploaded yet."}
      />

      {!isLoading && !error && hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="rounded-full border border-surface-border px-6 py-2 text-sm font-medium text-gray-200 hover:border-brand-500 disabled:opacity-50"
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

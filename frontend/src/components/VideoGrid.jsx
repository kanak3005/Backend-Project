import VideoCard from "./VideoCard";
import VideoCardSkeleton from "./VideoCardSkeleton";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { Video } from "lucide-react";

export default function VideoGrid({ videos, isLoading, error, onRetry, emptyMessage }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!videos || videos.length === 0) {
    return (
      <EmptyState
        icon={Video}
        title="No videos found"
        description={emptyMessage || "There's nothing to show here yet."}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
}

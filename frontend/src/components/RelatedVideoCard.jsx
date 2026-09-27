import { Link } from "react-router-dom";
import { formatCount, formatDuration, formatRelativeTime } from "../utils/formatters";

export default function RelatedVideoCard({ video }) {
  return (
    <Link to={`/watch/${video._id}`} className="group flex gap-2.5">
      <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-surface-card">
        <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" loading="lazy" />
        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-medium text-white">
          {formatDuration(video.duration)}
        </span>
      </div>
      <div className="min-w-0">
        <h4 className="line-clamp-2 text-sm font-medium text-gray-100 group-hover:text-white">
          {video.title}
        </h4>
        <p className="mt-1 truncate text-xs text-gray-500">{video.owner?.fullname}</p>
        <p className="text-xs text-gray-500">
          {formatCount(video.views)} views • {formatRelativeTime(video.createdAt)}
        </p>
      </div>
    </Link>
  );
}

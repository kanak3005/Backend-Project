import { Link } from "react-router-dom";
import { formatCount, formatDuration, formatRelativeTime } from "../utils/formatters";

// props.video ka shape (backend GET /videos se aata hai):
// { _id, thumbnail, title, duration, views, createdAt, owner: { _id, username, fullname, avatar } }
export default function VideoCard({ video }) {
  return (
    <Link to={`/watch/${video._id}`} className="group block">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface-card">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className="mt-3 flex gap-3">
        {video.owner?.avatar && (
          <img
            src={video.owner.avatar}
            alt={video.owner?.username}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        )}
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-100 group-hover:text-white">
            {video.title}
          </h3>
          {video.owner?.fullname && (
            <p className="mt-1 truncate text-xs text-gray-400">{video.owner.fullname}</p>
          )}
          <p className="text-xs text-gray-500">
            {formatCount(video.views)} views • {formatRelativeTime(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}

import { Link } from "react-router-dom";
import { formatCount, formatDuration, formatRelativeTime } from "../utils/formatters";
import { UserRound } from "lucide-react";

// props.video ka shape (backend GET /videos se aata hai):
// { _id, thumbnail, title, duration, views, createdAt, owner: { _id, username, fullname, avatar } }
export default function VideoCard({ video }) {
  const metadata = [
    typeof video.views === "number" && `${formatCount(video.views)} views`,
    video.createdAt && formatRelativeTime(video.createdAt),
  ].filter(Boolean);

  return (
    <Link to={`/watch/${video._id}`} className="group block min-w-0">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-card ring-1 ring-white/[0.04]">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent opacity-60" />
        <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className="mt-3 flex gap-3.5">
        {video.owner?.avatar ? (
          <img
            src={video.owner.avatar}
            alt={video.owner?.username}
            className="h-10 w-10 shrink-0 rounded-full border border-white/[0.07] object-cover"
          />
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-hover text-gray-500">
            <UserRound size={17} />
          </span>
        )}
        <div className="min-w-0 pt-0.5">
          <h3 className="line-clamp-2 text-[14px] font-semibold leading-5 text-gray-100 transition group-hover:text-brand-100">
            {video.title}
          </h3>
          {video.owner && (
            <p className="mt-1.5 truncate text-xs text-gray-400">
              {video.owner.fullname || video.owner.username}
            </p>
          )}
          {metadata.length > 0 && (
            <p className="mt-0.5 text-xs text-gray-500">{metadata.join(" · ")}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

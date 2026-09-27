// Video duration (seconds) ko "12:34" jaise format me convert karta hai
export function formatDuration(totalSeconds) {
  if (!totalSeconds && totalSeconds !== 0) return "0:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const paddedSeconds = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${paddedSeconds}`;
  }
  return `${minutes}:${paddedSeconds}`;
}

// 12500 views -> "12.5K views"
export function formatCount(count) {
  if (count === undefined || count === null) return "0";
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

// "2026-09-01T10:00:00Z" -> "2 days ago"
export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const intervals = [
    { label: "year", secs: 31536000 },
    { label: "month", secs: 2592000 },
    { label: "day", secs: 86400 },
    { label: "hour", secs: 3600 },
    { label: "minute", secs: 60 },
  ];

  for (const { label, secs } of intervals) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) {
      return `${value} ${label}${value > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

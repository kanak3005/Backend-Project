export default function VideoCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video w-full rounded-xl bg-surface-card" />
      <div className="mt-3 flex gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-surface-card" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-5/6 rounded bg-surface-card" />
          <div className="h-3 w-2/3 rounded bg-surface-card" />
          <div className="h-3 w-1/2 rounded bg-surface-card" />
        </div>
      </div>
    </div>
  );
}

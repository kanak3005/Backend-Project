import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border py-16 text-center">
      <Icon className="mb-3 text-gray-600" size={36} />
      <h3 className="text-base font-semibold text-gray-200">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
    </div>
  );
}

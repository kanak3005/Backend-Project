import { useState } from "react";
import { MoreVertical, Trash2, Pencil } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatRelativeTime } from "../utils/formatters";

// props.comment shape (backend se aata hai):
// { _id, content, createdAt, owner: { _id, username, fullname, avatar } }
export default function CommentItem({ comment, onUpdate, onDelete }) {
  const { user } = useAuth();
  const isOwner = user?._id === comment.owner?._id;

  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editedContent.trim()) return;
    setIsSaving(true);
    try {
      await onUpdate(comment._id, editedContent.trim());
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex gap-3 py-3">
      <img
        src={comment.owner?.avatar}
        alt={comment.owner?.username}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-100">
            {comment.owner?.fullname || comment.owner?.username}
          </span>
          <span className="text-xs text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
        </div>

        {isEditing ? (
          <div className="mt-1.5 space-y-2">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-full bg-brand-500 px-4 py-1 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(comment.content);
                }}
                className="rounded-full px-4 py-1 text-xs text-gray-400 hover:bg-surface-hover"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-300">{comment.content}</p>
        )}
      </div>

      {isOwner && !isEditing && (
        <div className="relative shrink-0">
          <button onClick={() => setMenuOpen((o) => !o)} className="text-gray-500 hover:text-gray-300">
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-32 rounded-lg border border-surface-border bg-surface-card p-1 shadow-lg">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-200 hover:bg-surface-hover"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(comment._id);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-red-400 hover:bg-surface-hover"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

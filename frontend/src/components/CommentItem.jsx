import { useState } from "react";
import { MoreVertical, Trash2, Pencil, ThumbsUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../utils/formatters";

// props.comment shape (backend se aata hai):
// { _id, content, createdAt, owner: { _id, username, fullname, avatar } }
export default function CommentItem({ comment, onUpdate, onDelete, onToggleLike }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?._id === comment.owner?._id;

  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [liked, setLiked] = useState(null);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    setIsLiking(true);
    try {
      const nextLiked = await onToggleLike(comment._id);
      if (typeof nextLiked === "boolean") setLiked(nextLiked);
    } finally {
      setIsLiking(false);
    }
  };

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
        <button
          onClick={handleLike}
          disabled={isLiking}
          aria-pressed={liked === true}
          className={`mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition disabled:opacity-50 ${
            liked
              ? "bg-brand-500/10 text-brand-300"
              : "text-gray-500 hover:bg-surface-hover hover:text-gray-200"
          }`}
        >
          <ThumbsUp size={13} className={liked ? "fill-current" : ""} />
          {isLiking ? "Updating..." : liked ? "Liked" : "Like"}
        </button>
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

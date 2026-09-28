import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addComment, deleteComment, getVideoComments, updateComment } from "../api/comment.api";
import { toggleCommentLike } from "../api/like.api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import CommentItem from "./CommentItem";
import EmptyState from "./EmptyState";
import { MessageSquare } from "lucide-react";

export default function CommentSection({ videoId }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchComments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const fetchComments = async (page) => {
    setIsLoading(true);
    setError("");
    try {
      // Public endpoint - login ke bina bhi comments padh sakte hai
      const response = await getVideoComments(videoId, { page, limit: 20 });
      setComments(response.data.data.comments);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load comments.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    if (!newComment.trim()) return;
    setIsPosting(true);
    try {
      const response = await addComment(videoId, newComment.trim());
      setComments((prev) => [response.data.data, ...prev]);
      setNewComment("");
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not post comment.", "error");
    } finally {
      setIsPosting(false);
    }
  };

  const handleUpdate = async (commentId, content) => {
    try {
      const response = await updateComment(commentId, content);
      setComments((prev) => prev.map((c) => (c._id === commentId ? response.data.data : c)));
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not update comment.", "error");
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      showToast("Comment deleted.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not delete comment.", "error");
    }
  };

  const handleToggleLike = async (commentId) => {
    try {
      const response = await toggleCommentLike(commentId);
      return response.data.data.liked;
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not update comment like.", "error");
      return null;
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-white">
        {pagination ? `${pagination.totalComments} Comments` : "Comments"}
      </h2>

      {/* Add comment box - logged-out users bhi ise dekhte hai,
          par submit karne par login page par bhej diya jaayega */}
      <form onSubmit={handleAddComment} className="mb-6 flex gap-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={isAuthenticated ? "Add a comment..." : "Log in to add a comment"}
          className="flex-1 border-b border-surface-border bg-transparent pb-2 text-sm text-white outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={isPosting || !newComment.trim()}
          className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40"
        >
          {isPosting ? "Posting..." : "Comment"}
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading comments...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : comments.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No comments yet" description="Be the first to say something." />
      ) : (
        <div className="divide-y divide-surface-border">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onToggleLike={handleToggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import {
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../api/video.api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
import ErrorState from "../components/ErrorState";

export default function EditVideo() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const fetchVideo = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getVideoById(videoId);
      const fetchedVideo = response.data.data;

      // Ownership guard - sirf owner hi edit kar sake, warna wapas bhej do
      if (fetchedVideo.owner?._id !== user?._id) {
        showToast("You can only edit your own videos.", "error");
        navigate(`/watch/${videoId}`);
        return;
      }

      setVideo(fetchedVideo);
      setTitle(fetchedVideo.title);
      setDescription(fetchedVideo.description);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load this video.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Real backend endpoint: PATCH /videos/:videoId (multipart if thumbnail changes)
      await updateVideo(videoId, {
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnailFile,
      });
      showToast("Video updated successfully.");
      navigate(`/watch/${videoId}`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not save changes.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    setIsTogglingPublish(true);
    try {
      await togglePublishStatus(videoId);
      setVideo((prev) => ({ ...prev, isPublished: !prev.isPublished }));
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not change publish status.", "error");
    } finally {
      setIsTogglingPublish(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVideo(videoId);
      showToast("Video deleted.");
      navigate("/dashboard");
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not delete video.", "error");
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-2xl px-4 py-8 text-gray-400">Loading...</div>;
  }

  if (error || !video) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <ErrorState message={error} onRetry={fetchVideo} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold text-white">Edit video</h1>

      <form onSubmit={handleSave} className="mt-6 space-y-5">
        <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-surface-border bg-surface-card p-4 hover:border-brand-500">
          <img
            src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : video.thumbnail}
            alt="thumbnail"
            className="h-16 w-28 rounded-lg object-cover"
          />
          <div className="flex items-center gap-1.5 text-sm text-gray-300">
            <ImageIcon size={16} /> Change thumbnail
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          />
        </label>

        <div>
          <label className="mb-1 block text-sm text-gray-300">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-300">Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-lg bg-brand-500 py-2.5 font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="mt-8 space-y-3 border-t border-surface-border pt-6">
        <div className="flex items-center justify-between rounded-xl bg-surface-card p-4">
          <div>
            <p className="text-sm font-medium text-gray-200">
              {video.isPublished ? "Published" : "Unpublished (private)"}
            </p>
            <p className="text-xs text-gray-500">
              {video.isPublished ? "Visible to everyone" : "Only visible to you"}
            </p>
          </div>
          <button
            onClick={handleTogglePublish}
            disabled={isTogglingPublish}
            className="rounded-full border border-surface-border px-4 py-1.5 text-sm text-gray-200 hover:border-brand-500"
          >
            {video.isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
        >
          <Trash2 size={16} /> Delete video
        </button>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete this video?"
        description="This action cannot be undone. The video will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

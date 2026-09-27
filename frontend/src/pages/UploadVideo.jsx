import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileVideo, Image as ImageIcon } from "lucide-react";
import { publishVideo } from "../api/video.api";
import { useToast } from "../context/ToastContext";

export default function UploadVideo() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progressText, setProgressText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!videoFile || !thumbnailFile) {
      setError("Both a video file and a thumbnail are required.");
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    setIsUploading(true);
    setProgressText("Starting upload...");
    try {
      // Real backend endpoint: POST /videos (multipart, fields: videoFile, thumbnail, title, description)
      const response = await publishVideo(
        {
          title: title.trim(),
          description: description.trim(),
          videoFile,
          thumbnail: thumbnailFile,
        },
        (percent) => setProgressText(`Uploading... ${percent}%`)
      );
      showToast("Video uploaded successfully!");
      navigate(`/watch/${response.data.data._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setProgressText("");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold text-white">Upload video</h1>
      <p className="mt-1 text-sm text-gray-400">Share something new with your subscribers.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Video file picker */}
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-surface-card p-8 text-center hover:border-brand-500">
          <FileVideo size={28} className="mb-2 text-gray-500" />
          <span className="text-sm text-gray-300">
            {videoFile ? videoFile.name : "Click to select a video file"}
          </span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          />
        </label>

        {/* Thumbnail picker with preview */}
        <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-surface-border bg-surface-card p-4 hover:border-brand-500">
          {thumbnailFile ? (
            <img
              src={URL.createObjectURL(thumbnailFile)}
              alt="thumbnail preview"
              className="h-16 w-28 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-28 items-center justify-center rounded-lg bg-surface text-gray-600">
              <ImageIcon size={20} />
            </div>
          )}
          <div>
            <p className="text-sm text-gray-300">
              {thumbnailFile ? thumbnailFile.name : "Click to select a thumbnail image"}
            </p>
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
          disabled={isUploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-2.5 font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          <UploadCloud size={18} />
          {isUploading ? progressText || "Uploading..." : "Publish video"}
        </button>
      </form>
    </div>
  );
}

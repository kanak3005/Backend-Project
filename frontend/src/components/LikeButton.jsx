import { useEffect, useState } from "react";
import { ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toggleVideoLike } from "../api/like.api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

// NOTE: Backend ka toggle endpoint sirf { liked: true/false } return karta hai -
// koi total likes count ya "already liked" initial status nahi milta (getVideoById
// me bhi ye field nahi hai). Isliye ye button sirf is session ke toggle state ko
// track karta hai, ek total count nahi dikhata - ye ek real backend limitation hai,
// fake number dikhana galat hoga.
export default function LikeButton({ videoId }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setLiked(false);
  }, [videoId]);

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    setIsToggling(true);
    try {
      const response = await toggleVideoLike(videoId);
      setLiked(response.data.data.liked);
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not update your like.", "error");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isToggling}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
        liked
          ? "border-brand-500 bg-brand-500/10 text-brand-400"
          : "border-surface-border text-gray-200 hover:border-brand-500"
      }`}
    >
      <ThumbsUp size={16} className={liked ? "fill-brand-400" : ""} />
      {liked ? "Liked" : "Like"}
    </button>
  );
}

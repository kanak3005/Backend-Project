import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toggleSubscription } from "../api/subscription.api";
import { useAuth } from "../context/AuthContext";
import { formatCount } from "../utils/formatters";

// props: channelId, initialIsSubscribed, initialSubscribersCount
// Ye dono initial values getUserChannelProfile se aate hai (backend already
// isSubscribed aur subscribersCount calculate karke deta hai)
export default function SubscribeButton({ channelId, initialIsSubscribed, initialSubscribersCount }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [subscribersCount, setSubscribersCount] = useState(initialSubscribersCount);
  const [isToggling, setIsToggling] = useState(false);

  // Apna khud ka channel subscribe nahi kar sakte
  if (user?._id === channelId) return null;

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    setIsToggling(true);
    // Optimistic update - turant UI badal do, backend confirm hote hi rehne do
    const nextState = !isSubscribed;
    setIsSubscribed(nextState);
    setSubscribersCount((prev) => prev + (nextState ? 1 : -1));
    try {
      await toggleSubscription(channelId);
    } catch (err) {
      // fail hua to wapas purani state par le aao
      setIsSubscribed(!nextState);
      setSubscribersCount((prev) => prev + (nextState ? -1 : 1));
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isToggling}
      className={`rounded-full px-5 py-2 text-sm font-medium transition ${
        isSubscribed
          ? "border border-surface-border text-gray-200 hover:border-red-500 hover:text-red-400"
          : "bg-brand-500 text-white hover:bg-brand-600"
      }`}
    >
      {isSubscribed ? "Subscribed" : "Subscribe"}
      <span className="ml-1.5 opacity-70">({formatCount(subscribersCount)})</span>
    </button>
  );
}

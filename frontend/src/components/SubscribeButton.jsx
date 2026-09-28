import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSubscribedChannels, toggleSubscription } from "../api/subscription.api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatCount } from "../utils/formatters";

// props: channelId, initialIsSubscribed, initialSubscribersCount
// Ye dono initial values getUserChannelProfile se aate hai (backend already
// isSubscribed aur subscribersCount calculate karke deta hai)
export default function SubscribeButton({ channelId, initialIsSubscribed, initialSubscribersCount }) {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [subscribersCount, setSubscribersCount] = useState(initialSubscribersCount);
  const [isToggling, setIsToggling] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  useEffect(() => {
    setIsSubscribed(initialIsSubscribed);
    setSubscribersCount(initialSubscribersCount);
  }, [channelId, initialIsSubscribed, initialSubscribersCount]);

  useEffect(() => {
    if (!isAuthenticated || !user?._id || user._id === channelId) return;
    let cancelled = false;
    const checkSubscription = async () => {
      setIsCheckingSubscription(true);
      try {
        const response = await getSubscribedChannels(user._id);
        const subscribed = response.data.data.some((entry) => entry.channel?._id === channelId);
        if (!cancelled) setIsSubscribed(subscribed);
      } catch (err) {
        if (!cancelled) {
          showToast(err?.response?.data?.message || "Could not check subscription status.", "error");
        }
      } finally {
        if (!cancelled) setIsCheckingSubscription(false);
      }
    };
    checkSubscription();
    return () => {
      cancelled = true;
    };
  }, [channelId, isAuthenticated, showToast, user?._id]);

  // Apna khud ka channel subscribe nahi kar sakte
  if (user?._id === channelId) return null;

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    setIsToggling(true);
    try {
      const response = await toggleSubscription(channelId);
      const subscribed = response.data.data.subscribed;
      setIsSubscribed(subscribed);
      setSubscribersCount((count) => Math.max(0, (Number(count) || 0) + (subscribed ? 1 : -1)));
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not update subscription.", "error");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isToggling || isCheckingSubscription}
      className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
        isSubscribed
          ? "border border-surface-border text-gray-200 hover:border-red-500 hover:text-red-400"
          : "bg-brand-500 text-white hover:bg-brand-600"
      }`}
    >
      {isCheckingSubscription ? "Checking..." : isSubscribed ? "Subscribed" : "Subscribe"}
      <span className="ml-1.5 opacity-70">({formatCount(subscribersCount)})</span>
    </button>
  );
}

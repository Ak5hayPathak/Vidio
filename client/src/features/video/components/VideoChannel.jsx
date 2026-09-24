import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext.jsx";

import {
  getSubscriptionStatus,
  toggleSubscription,
} from "../../subscriptions/subscriptions.service.js";

function VideoChannel({ video }) {
  const { user } = useAuth();

  const channel = video.owner;

  const isOwner = user?._id === channel?._id;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!channel?._id || isOwner) {
        setCheckingSubscription(false);
        return;
      }

      try {
        setCheckingSubscription(true);

        const response = await getSubscriptionStatus(channel._id);

        setIsSubscribed(response.data?.isSubscribed ?? false);
      } catch (error) {
        console.error("Failed to check subscription status:", error);

        setIsSubscribed(false);
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscriptionStatus();
  }, [channel?._id, isOwner]);

  const handleSubscribe = async () => {
    if (!channel?._id || loading || checkingSubscription || isOwner) {
      return;
    }

    try {
      setLoading(true);

      const response = await toggleSubscription(channel._id);

      setIsSubscribed((previous) => !previous);
    } catch (error) {
      console.error("Failed to toggle subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Link to={`/channel/${channel.username}`}>
        <img
          src={channel.avatar}
          alt={channel.fullName}
          className="h-10 w-10 rounded-full object-cover"
        />
      </Link>

      <div className="min-w-0">
        <Link
          to={`/channel/${channel.username}`}
          className="
            block
            truncate
            text-sm
            font-semibold
            text-white
            hover:underline
          "
        >
          {channel.fullName}
        </Link>

        <p className="text-xs text-gray-400">@{channel.username}</p>
      </div>

      {!isOwner && (
        <button
          type="button"
          onClick={handleSubscribe}
          disabled={loading || checkingSubscription}
          className={`ml-6 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            isSubscribed
              ? "bg-gray-800 text-white hover:bg-gray-700"
              : "bg-red-600 text-white hover:bg-red-700"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {checkingSubscription
            ? "Loading..."
            : isSubscribed
              ? "Subscribed"
              : "Subscribe"}
        </button>
      )}
    </div>
  );
}

export default VideoChannel;

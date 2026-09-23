import { useState } from "react";
import { Link } from "react-router-dom";

import { toggleSubscription } from "../../channel/channel.service.js";

function VideoChannel({ video }) {
  const channel = video.owner;

  const [isSubscribed, setIsSubscribed] = useState(
    video.isSubscribed || false,
  );

  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!channel?._id || loading) return;

    try {
      setLoading(true);

      const data = await toggleSubscription(channel._id);

      const isNowSubscribed =
        data?.isSubscribed ?? !isSubscribed;

      setIsSubscribed(isNowSubscribed);
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
          className="block truncate text-sm font-semibold text-white hover:underline"
        >
          {channel.fullName}
        </Link>

        <p className="text-xs text-gray-400">
          @{channel.username}
        </p>
      </div>

      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className={`ml-6 rounded-lg px-4 py-2 text-sm font-semibold transition ${
          isSubscribed
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : "bg-red-600 text-white hover:bg-red-700"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {isSubscribed ? "Subscribed" : "Subscribe"}
      </button>
    </div>
  );
}

export default VideoChannel;
import { UserCircle, UserMinus } from "lucide-react";

function SubscriptionItem({ subscription, unsubscribing, onUnsubscribe }) {
  const channel = subscription.channelDetails;
  const channelId = subscription.channel;

  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        border-b
        border-white/5
        px-4
        py-4
        last:border-b-0
      "
    >
      {/* Channel info */}
      <div className="flex min-w-0 items-center gap-4">
        {/* Avatar */}
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-full
            bg-gray-800
          "
        >
          {channel?.avatar ? (
            <img
              src={channel.avatar}
              alt={channel.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserCircle size={28} className="text-gray-500" />
          )}
        </div>

        {/* Name */}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {channel?.fullName || channel?.username}
          </p>

          <p className="truncate text-xs text-gray-500">@{channel?.username}</p>
        </div>
      </div>

      {/* Unsubscribe */}
      <button
        type="button"
        onClick={() => onUnsubscribe(channelId)}
        disabled={unsubscribing === channelId}
        className="
          flex
          shrink-0
          items-center
          gap-2
          rounded-lg
          border
          border-white/10
          px-3
          py-2
          text-sm
          font-medium
          text-gray-300
          transition
          hover:border-red-500/30
          hover:bg-red-500/10
          hover:text-red-400
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <UserMinus size={16} />

        {unsubscribing === channelId ? "Removing..." : "Unsubscribe"}
      </button>
    </div>
  );
}

export default SubscriptionItem;

import { Link } from "react-router-dom";

function SubscriptionChannel({ subscription }) {
  const channel = subscription?.channelDetails;

  if (!channel?.username) {
    return null;
  }

  const name = channel.fullName || channel.username;

  const initial = name.charAt(0).toUpperCase();

  return (
    <Link
      to={`/channel/${channel.username}`}
      className="
        flex
        min-w-[140px]
        shrink-0
        flex-col
        items-center
        rounded-2xl
        border
        border-white/5
        bg-[#111318]
        px-4
        py-5
        transition
        hover:border-white/10
        hover:bg-[#15171d]
      "
    >
      {/* Avatar */}
      <div
        className="
          flex
          h-16
          w-16
          shrink-0
          items-center
          justify-center
          overflow-hidden
          rounded-full
          bg-red-600
          text-xl
          font-bold
          text-white
        "
      >
        {channel.avatar ? (
          <img
            src={channel.avatar}
            alt={name}
            loading="lazy"
            className="
              h-full
              w-full
              object-cover
            "
          />
        ) : (
          initial
        )}
      </div>

      {/* Channel name */}
      <p
        className="
          mt-3
          w-full
          truncate
          text-center
          text-sm
          font-semibold
          text-white
        "
        title={name}
      >
        {name}
      </p>

      {/* Username */}
      <p
        className="
          mt-1
          w-full
          truncate
          text-center
          text-xs
          text-gray-500
        "
      >
        @{channel.username}
      </p>
    </Link>
  );
}

export default SubscriptionChannel;

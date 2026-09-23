import { Link } from "react-router-dom";

function SubscriberItem({ subscriber, isLast }) {
  const person =
    subscriber?.subscriberDetails || subscriber?.subscriber || subscriber;

  const username = person?.username;

  if (!username) {
    return null;
  }

  const name = person?.fullName || username;

  const initial = name.charAt(0).toUpperCase();

  return (
    <Link
      to={`/channel/${username}`}
      className={`
        flex
        items-center
        gap-4
        px-5
        py-4
        transition
        hover:bg-white/[0.04]
        ${!isLast ? "border-b border-white/5" : ""}
      `}
    >
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
          bg-red-600
          text-lg
          font-semibold
          text-white
        "
      >
        {person?.avatar ? (
          <img
            src={person.avatar}
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

      {/* Subscriber info */}
      <div className="min-w-0">
        <p
          className="
            truncate
            text-sm
            font-semibold
            text-white
          "
          title={name}
        >
          {name}
        </p>

        <p
          className="
            mt-1
            truncate
            text-xs
            text-gray-500
          "
        >
          @{username}
        </p>
      </div>
    </Link>
  );
}

export default SubscriberItem;

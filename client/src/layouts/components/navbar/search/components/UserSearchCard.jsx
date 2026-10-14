import { Link } from "react-router-dom";
import { UserRound, ArrowUpRight } from "lucide-react";

function UserSearchCard({ user }) {
  const username = user.username;
  const fullName = user.fullName || username || "Creator";

  return (
    <Link
      to={`/channel/${encodeURIComponent(username || "")}`}
      className="
        group flex w-full max-w-4xl min-w-0 items-center gap-3
        rounded-xl border border-white/10 bg-[#111318] p-3
        transition hover:border-white/20 hover:bg-white/[0.04]
      "
    >
      {/* Avatar */}
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/5 sm:h-14 sm:w-14">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={`${fullName}'s avatar`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-500">
            <UserRound size={24} />
          </div>
        )}
      </div>

      {/* User details */}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold text-white transition group-hover:text-red-400 sm:text-base">
          {fullName}
        </h2>

        <p className="mt-1 truncate text-xs text-gray-400 sm:text-sm">
          @{username || "unknown"}
        </p>
      </div>

      {/* Navigation indicator */}
      <ArrowUpRight
        size={18}
        className="shrink-0 text-gray-500 transition group-hover:text-white"
      />
    </Link>
  );
}

export default UserSearchCard;

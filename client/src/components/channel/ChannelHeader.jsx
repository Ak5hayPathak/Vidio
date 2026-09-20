import { Link } from "react-router-dom";

function ChannelHeader({
  channel,
  stats,
  formatCount,
  isOwner = false,
  actions = null,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111318]">
      {/* Cover */}
      <div className="relative h-48 overflow-hidden sm:h-56 lg:h-64">
        {channel.cover ? (
          <img
            src={channel.cover}
            alt="Channel cover"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#181a20]" />
        )}

        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Channel Info */}
      <div className="relative px-6 pb-6 sm:px-8">
        {/* Avatar */}
        <div className="-mt-14 mb-5">
          {channel.avatar ? (
            <img
              src={channel.avatar}
              alt={channel.name}
              className="
                h-28
                w-28
                rounded-full
                border-4
                border-[#111318]
                object-cover
              "
            />
          ) : (
            <div
              className="
                flex
                h-28
                w-28
                items-center
                justify-center
                rounded-full
                border-4
                border-[#111318]
                bg-gray-800
                text-3xl
                font-semibold
              "
            >
              {channel.initial}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Details */}
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold sm:text-3xl">
              {channel.name}
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              {channel.username}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-400">
              {/* Subscribers */}
              {isOwner ? (
                <Link
                  to="/subscribers"
                  className="
                    rounded-md
                    transition
                    hover:text-white
                  "
                >
                  <strong className="text-white">
                    {formatCount(stats.subscribers)}
                  </strong>{" "}
                  subscribers
                </Link>
              ) : (
                <span>
                  <strong className="text-white">
                    {formatCount(stats.subscribers)}
                  </strong>{" "}
                  subscribers
                </span>
              )}

              {/* Videos */}
              <span>
                <strong className="text-white">
                  {formatCount(stats.totalVideos)}
                </strong>{" "}
                videos
              </span>

              {/* Views */}
              {stats.totalViews !== undefined && (
                <span>
                  <strong className="text-white">
                    {formatCount(stats.totalViews)}
                  </strong>{" "}
                  views
                </span>
              )}

              {/* Likes */}
              {stats.totalLikes !== undefined && (
                <span>
                  <strong className="text-white">
                    {formatCount(stats.totalLikes)}
                  </strong>{" "}
                  likes
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 gap-3">
            {isOwner ? (
              <Link
                to="/channel/edit"
                className="
                  rounded-xl
                  bg-red-600
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  transition
                  hover:bg-red-700
                "
              >
                Edit Channel
              </Link>
            ) : (
              actions
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ChannelHeader;
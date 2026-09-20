import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import { Link } from "react-router-dom";

function Subscriptions() {
  const { user } = useAuth();

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/subscriptions/u/${user._id}`);
        setChannels(response.data.data.docs || []);
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
        setError(
          error.response?.data?.message || "Failed to load your subscriptions.",
        );
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) {
      fetchSubscriptions();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <div className="flex">
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/* Page heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold sm:text-3xl">Subscriptions</h1>

            <p className="mt-1 text-sm text-gray-500">
              Latest videos from channels you follow
            </p>
          </div>

          {/* Subscribed channels */}
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your channels</h2>

              <Link to="/subscriptions/manage">
                <button
                  className="
                  text-sm
                  font-medium
                  text-red-500
                  transition
                  hover:text-red-400
                "
                >
                  Manage
                </button>
              </Link>
            </div>

            {/* Loading */}
            {loading && (
              <div className="py-8 text-center text-sm text-gray-500">
                Loading your channels...
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="py-8 text-center text-sm text-red-500">
                {error}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && channels.length === 0 && (
              <div className="rounded-2xl border border-white/5 bg-[#111318] px-6 py-10 text-center">
                <p className="text-gray-400">
                  You haven't subscribed to any channels yet.
                </p>
              </div>
            )}

            {/* Channels */}
            {!loading && !error && channels.length > 0 && (
              <div
                className="
                  flex
                  gap-4
                  overflow-x-auto
                  pb-3
                "
              >
                {channels.map((subscription) => {
                  const channel = subscription.channelDetails;

                  return (
                    <div
                      key={subscription._id}
                      className="
                        flex
                        min-w-[120px]
                        shrink-0
                        cursor-pointer
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
                          overflow-hidden
                          items-center
                          justify-center
                          rounded-full
                          bg-red-600
                          text-xl
                          font-bold
                          text-white
                        "
                      >
                        {channel?.avatar ? (
                          <img
                            src={channel.avatar}
                            alt={channel.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          channel?.username?.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Channel name */}
                      <p
                        className="
                          mt-3
                          max-w-full
                          truncate
                          text-sm
                          font-semibold
                        "
                      >
                        {channel?.fullName || channel?.username}
                      </p>

                      {/* Username */}
                      <p className="mt-1 max-w-full truncate text-xs text-gray-500">
                        @{channel?.username}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Subscriptions;

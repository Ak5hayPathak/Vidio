import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext.jsx";

import { getUserSubscriptions } from "../subscriptions.service.js";

import SubscriptionChannel from "../components/SubscriptionChannel.jsx";

function Subscriptions() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [channels, setChannels] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?._id) {
      setChannels([]);
      setLoading(false);
      return;
    }

    const controller =
      new AbortController();

    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError("");

        const subscriptionData =
          await getUserSubscriptions(
            user._id,
            controller.signal,
          );

        setChannels(subscriptionData);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(
          "Failed to fetch subscriptions:",
          error,
        );

        setError(
          error.response?.data?.message ||
            "Failed to load your subscriptions.",
        );

        setChannels([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSubscriptions();

    return () => controller.abort();
  }, [user?._id, authLoading]);

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Subscriptions
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Latest videos from channels you follow
          </p>
        </div>

        {/* Subscribed channels */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Your channels
            </h2>

            <Link
              to="/subscriptions/manage"
              className="
                text-sm
                font-medium
                text-red-500
                transition
                hover:text-red-400
              "
            >
              Manage
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
            <div
              role="alert"
              className="
                rounded-xl
                border
                border-red-500/20
                bg-red-500/10
                px-4
                py-4
                text-center
                text-sm
                text-red-400
              "
            >
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading &&
            !error &&
            channels.length === 0 && (
              <div
                className="
                  rounded-2xl
                  border
                  border-white/5
                  bg-[#111318]
                  px-6
                  py-10
                  text-center
                "
              >
                <p className="text-gray-400">
                  You haven't subscribed to any
                  channels yet.
                </p>
              </div>
            )}

          {/* Channels */}
          {!loading &&
            !error &&
            channels.length > 0 && (
              <div
                className="
                  flex
                  gap-4
                  overflow-x-auto
                  pb-3
                  scrollbar-thin
                  scrollbar-track-transparent
                  scrollbar-thumb-white/10
                "
              >
                {channels.map(
                  (subscription) => (
                    <SubscriptionChannel
                      key={subscription._id}
                      subscription={subscription}
                    />
                  ),
                )}
              </div>
            )}
        </section>
      </main>
    </div>
  );
}

export default Subscriptions;
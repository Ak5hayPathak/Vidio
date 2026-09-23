import { useEffect, useState } from "react";
import { UserCircle } from "lucide-react";

import { useAuth } from "../../../context/AuthContext.jsx";

import {
  getUserSubscriptions,
  unsubscribeFromChannel,
} from "../subscriptions.service.js";

import SubscriptionItem from "../components/SubscriptionItem.jsx";

function ManageSubscriptions() {
  const { user } = useAuth();

  const [subscriptions, setSubscriptions] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [unsubscribing, setUnsubscribing] =
    useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?._id) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError("");

        const subscriptionsData =
          await getUserSubscriptions(
            user._id,
            controller.signal,
          );

        setSubscriptions(subscriptionsData);
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
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSubscriptions();

    return () => controller.abort();
  }, [user?._id]);

  const handleUnsubscribe = async (channelId) => {
    try {
      setUnsubscribing(channelId);
      setError("");

      await unsubscribeFromChannel(channelId);

      setSubscriptions((current) =>
        current.filter(
          (subscription) =>
            subscription.channel !== channelId,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to unsubscribe:",
        error,
      );

      setError(
        error.response?.data?.message ||
          "Failed to unsubscribe from the channel.",
      );
    } finally {
      setUnsubscribing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Manage Subscriptions
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the channels you're subscribed to
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center text-sm text-gray-500">
            Loading subscriptions...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="
              mb-6
              rounded-xl
              border
              border-red-500/20
              bg-red-500/10
              px-4
              py-3
              text-sm
              text-red-400
            "
          >
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading &&
          subscriptions.length === 0 && (
            <div
              className="
                rounded-2xl
                border
                border-white/5
                bg-[#111318]
                px-6
                py-12
                text-center
              "
            >
              <UserCircle
                size={40}
                className="mx-auto text-gray-600"
              />

              <h2 className="mt-4 text-lg font-semibold">
                No subscriptions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                You aren't subscribed to any channels yet.
              </p>
            </div>
          )}

        {/* Subscriptions */}
        {!loading &&
          subscriptions.length > 0 && (
            <div
              className="
                overflow-hidden
                rounded-2xl
                border
                border-white/5
                bg-[#111318]
              "
            >
              {subscriptions.map((subscription) => (
                <SubscriptionItem
                  key={subscription._id}
                  subscription={subscription}
                  unsubscribing={unsubscribing}
                  onUnsubscribe={handleUnsubscribe}
                />
              ))}
            </div>
          )}
      </main>
    </div>
  );
}

export default ManageSubscriptions;
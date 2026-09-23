import { useEffect, useState } from "react";
import { UsersRound } from "lucide-react";

import { useAuth } from "../../../context/AuthContext.jsx";

import { getSubscribers } from "../subscriptions.service.js";

import SubscriberItem from "../components/SubscriberItem.jsx";

function Subscribers() {
  const { user, loading: authLoading } = useAuth();

  const [subscribers, setSubscribers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?._id) {
      setSubscribers([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchSubscribers = async () => {
      try {
        setLoading(true);
        setError("");

        const subscriberData = await getSubscribers(
          user._id,
          controller.signal,
        );

        setSubscribers(subscriberData);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Failed to fetch subscribers:", error);

        setError(
          error.response?.data?.message || "Failed to load your subscribers.",
        );

        setSubscribers([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSubscribers();

    return () => controller.abort();
  }, [user?._id, authLoading]);

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">Subscribers</h1>

          <p className="mt-1 text-sm text-gray-500">
            People who have subscribed to your channel
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center text-sm text-gray-500">
            Loading your subscribers...
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
              text-sm
              text-red-400
            "
          >
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && subscribers.length === 0 && (
          <div
            className="
                flex
                min-h-80
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-white/10
                bg-[#111318]
                px-6
                text-center
              "
          >
            <div
              className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-red-600/10
                  text-red-500
                "
            >
              <UsersRound size={25} />
            </div>

            <h2 className="mt-4 text-xl font-semibold">No subscribers yet</h2>

            <p className="mt-2 max-w-md text-sm text-gray-500">
              When people subscribe to your channel, they'll appear here.
            </p>
          </div>
        )}

        {/* Subscribers */}
        {!loading && !error && subscribers.length > 0 && (
          <div
            className="
                max-w-3xl
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-[#111318]
              "
          >
            {subscribers.map((subscriber, index) => (
              <SubscriberItem
                key={
                  subscriber?._id ||
                  subscriber?.subscriberDetails?._id ||
                  subscriber?.subscriber?._id ||
                  index
                }
                subscriber={subscriber}
                isLast={index === subscribers.length - 1}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Subscribers;

import { useEffect, useState } from "react";
import { UserCircle, UserMinus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
function ManageSubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unsubscribing, setUnsubscribing] = useState(null);
  const [error, setError] = useState("");
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/subscriptions/u/${user._id}`);
      setSubscriptions(response.data.data.docs || []);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      setError(
        error.response?.data?.message || "Failed to load your subscriptions.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?._id) {
      fetchSubscriptions();
    }
  }, [user?._id]);
  const handleUnsubscribe = async (channelId) => {
    try {
      setUnsubscribing(channelId);
      await api.post(`/subscriptions/c/${channelId}`);
      setSubscriptions((prev) =>
        prev.filter((subscription) => subscription.channel !== channelId),
      );
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
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
      {" "}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {" "}
        {/* Header */}{" "}
        <div className="mb-8">
          {" "}
          <h1 className="text-2xl font-bold sm:text-3xl">
            {" "}
            Manage Subscriptions{" "}
          </h1>{" "}
          <p className="mt-1 text-sm text-gray-500">
            {" "}
            Manage the channels you're subscribed to{" "}
          </p>{" "}
        </div>{" "}
        {/* Loading */}{" "}
        {loading && (
          <div className="py-12 text-center text-sm text-gray-500">
            {" "}
            Loading subscriptions...{" "}
          </div>
        )}{" "}
        {/* Error */}{" "}
        {!loading && error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {" "}
            {error}{" "}
          </div>
        )}{" "}
        {/* Empty state */}{" "}
        {!loading && subscriptions.length === 0 && (
          <div className="rounded-2xl border border-white/5 bg-[#111318] px-6 py-12 text-center">
            {" "}
            <UserCircle size={40} className="mx-auto text-gray-600" />{" "}
            <h2 className="mt-4 text-lg font-semibold"> No subscriptions </h2>{" "}
            <p className="mt-1 text-sm text-gray-500">
              {" "}
              You aren't subscribed to any channels yet.{" "}
            </p>{" "}
          </div>
        )}{" "}
        {/* Subscriptions */}{" "}
        {!loading && subscriptions.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#111318]">
            {" "}
            {subscriptions.map((subscription) => {
              const channel = subscription.channelDetails;
              return (
                <div
                  key={subscription._id}
                  className=" flex items-center justify-between gap-4 border-b border-white/5 px-4 py-4 last:border-b-0 "
                >
                  {" "}
                  {/* Channel info */}{" "}
                  <div className="flex min-w-0 items-center gap-4">
                    {" "}
                    {/* Avatar */}{" "}
                    <div className=" flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-800 ">
                      {" "}
                      {channel?.avatar ? (
                        <img
                          src={channel.avatar}
                          alt={channel.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserCircle size={28} className="text-gray-500" />
                      )}{" "}
                    </div>{" "}
                    {/* Name */}{" "}
                    <div className="min-w-0">
                      {" "}
                      <p className="truncate text-sm font-semibold">
                        {" "}
                        {channel?.fullName || channel?.username}{" "}
                      </p>{" "}
                      <p className="truncate text-xs text-gray-500">
                        {" "}
                        @{channel?.username}{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Unsubscribe */}{" "}
                  <button
                    onClick={() => handleUnsubscribe(subscription.channel)}
                    disabled={unsubscribing === subscription.channel}
                    className=" flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-gray-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50 "
                  >
                    {" "}
                    <UserMinus size={16} />{" "}
                    {unsubscribing === subscription.channel
                      ? "Removing..."
                      : "Unsubscribe"}{" "}
                  </button>{" "}
                </div>
              );
            })}{" "}
          </div>
        )}{" "}
      </main>{" "}
    </div>
  );
}
export default ManageSubscriptions;
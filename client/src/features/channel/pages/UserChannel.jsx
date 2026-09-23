import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext.jsx";

import ChannelLoading from "../components/ChannelLoading.jsx";
import ChannelTabs from "../components/ChannelTabs.jsx";
import ChannelHeader from "../components/ChannelHeader.jsx";
import ChannelVideos from "../components/ChannelVideos.jsx";
import ChannelAbout from "../components/ChannelAbout.jsx";
import ChannelSubscribeButton from "../components/ChannelSubscribeButton.jsx";

import {
  getUserChannel,
  getUserChannelVideos,
  toggleSubscription,
} from "../channel.service.js";

import { formatChannel, formatCount } from "../channel.utils.js";

function UserChannel() {
  const { username } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);

  const [stats, setStats] = useState({
    subscribers: 0,
    totalVideos: 0,
  });

  const [subscribed, setSubscribed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("Videos");

  useEffect(() => {
    if (authLoading || !username) return;

    const controller = new AbortController();

    const fetchChannelData = async () => {
      try {
        setLoading(true);
        setError("");

        const [channelDataResponse, videosData] = await Promise.all([
          getUserChannel(username, controller.signal),

          getUserChannelVideos(username, controller.signal),
        ]);

        setChannelData(channelDataResponse);

        setSubscribed(channelDataResponse?.isSubscribed || false);

        setStats({
          subscribers: channelDataResponse?.subscribersCount || 0,

          totalVideos: videosData?.totalDocs || 0,
        });

        setVideos(videosData?.docs || []);
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Failed to fetch channel data:", err);

        setError(
          err.response?.data?.message || "Unable to load channel information.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchChannelData();

    return () => controller.abort();
  }, [username, authLoading]);

  const handleSubscribe = useCallback(async () => {
    if (!user || !channelData?._id || subscribeLoading) {
      return;
    }

    if (user._id === channelData._id) {
      return;
    }

    try {
      setSubscribeLoading(true);
      setError("");

      const data = await toggleSubscription(channelData._id);

      const isNowSubscribed = data?.isSubscribed ?? !subscribed;

      setSubscribed(isNowSubscribed);

      setStats((current) => ({
        ...current,
        subscribers: Math.max(
          0,
          current.subscribers + (isNowSubscribed ? 1 : -1),
        ),
      }));
    } catch (err) {
      console.error("Failed to toggle subscription:", err);

      setError(err.response?.data?.message || "Unable to update subscription.");
    } finally {
      setSubscribeLoading(false);
    }
  }, [user, channelData, subscribeLoading, subscribed]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  if (authLoading || loading) {
    return <ChannelLoading />;
  }

  if (!channelData) {
    return (
      <div className="min-h-screen bg-[#08090b] text-white">
        <main className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-xl font-semibold">Channel not found</h1>

            <p className="mt-2 text-sm text-gray-500">
              {error || "Unable to find this channel."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const channel = formatChannel(channelData);

  const isOwner = user?._id === channelData._id;

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">
        {/* Channel Header */}
        <ChannelHeader
          channel={channel}
          stats={stats}
          formatCount={formatCount}
          isOwner={isOwner}
          actions={
            !isOwner && (
              <ChannelSubscribeButton
                subscribed={subscribed}
                loading={subscribeLoading}
                onSubscribe={handleSubscribe}
              />
            )
          }
        />

        {/* Tabs */}
        <ChannelTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="
              mt-8
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

        {/* Videos */}
        {activeTab === "Videos" && (
          <ChannelVideos
            videos={videos}
            channel={channel}
            formatCount={formatCount}
            isOwner={isOwner}
          />
        )}

        {/* Tweets */}
        {activeTab === "Tweets" && (
          <section className="mt-8 text-sm text-gray-500">
            Tweets coming soon.
          </section>
        )}

        {/* Playlists */}
        {activeTab === "Playlists" && (
          <section className="mt-8 text-sm text-gray-500">
            Playlists coming soon.
          </section>
        )}

        {/* About */}
        {activeTab === "About" && (
          <ChannelAbout about={channel.about} isOwner={isOwner} />
        )}
      </main>
    </div>
  );
}

export default UserChannel;

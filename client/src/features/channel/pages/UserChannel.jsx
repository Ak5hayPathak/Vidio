import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";

import {
  getUserChannel,
  getUserChannelVideos,
  getUserChannelPlaylists,
  toggleSubscription,
} from "../channel.service.js";

import ChannelLoading from "../components/ChannelLoading.jsx";
import ChannelHeader from "../components/ChannelHeader.jsx";
import ChannelTabs from "../components/ChannelTabs.jsx";
import ChannelVideos from "../components/ChannelVideos.jsx";
import ChannelPlaylists from "../components/ChannelPlaylists.jsx";
import ChannelAbout from "../components/ChannelAbout.jsx";

import { formatCount } from "../channel.utils.js";

function UserChannel() {
  const { username } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [stats, setStats] = useState({
    subscribers: 0,
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Videos");
  const [subscribing, setSubscribing] = useState(false);

  const isOwner = Boolean(
    user?._id &&
    channelData?._id &&
    user._id.toString() === channelData._id.toString(),
  );

  const channel = useMemo(
    () => ({
      ...channelData,
      name: channelData?.fullName || channelData?.username || "",
      username: channelData?.username ? `@${channelData.username}` : "",
      avatar: channelData?.avatar,
      cover: channelData?.coverImage,
      about: channelData?.about || "",
      initial: (channelData?.fullName || channelData?.username || "?")
        .charAt(0)
        .toUpperCase(),
    }),
    [channelData],
  );

  useEffect(() => {
    if (authLoading) return;

    if (!username) {
      setChannelData(null);
      setVideos([]);
      setPlaylists([]);
      setError("Channel not found.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchChannelData() {
      try {
        setLoading(true);
        setError("");

        const [channelResponse, videosResponse, playlistsResponse] =
          await Promise.all([
            getUserChannel(username, controller.signal),
            getUserChannelVideos(username, controller.signal),
            getUserChannelPlaylists(username, controller.signal),
          ]);

        if (controller.signal.aborted) return;

        setChannelData(channelResponse || null);
        setVideos(
          Array.isArray(videosResponse)
            ? videosResponse
            : videosResponse?.docs || [],
        );
        setPlaylists(
          Array.isArray(playlistsResponse)
            ? playlistsResponse
            : playlistsResponse?.docs || [],
        );

        setStats({
          subscribers: channelResponse?.subscribersCount ?? 0,
          totalVideos: channelResponse?.videosCount ?? 0,
          totalViews: channelResponse?.totalViews ?? 0,
          totalLikes: channelResponse?.totalLikes ?? 0,
        });
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Failed to fetch user channel:", err);

        setChannelData(null);
        setVideos([]);
        setPlaylists([]);
        setError(
          err.response?.data?.message || "Unable to load channel information.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchChannelData();

    return () => controller.abort();
  }, [username, authLoading]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleSubscribe = useCallback(async () => {
    if (!user || !channelData?._id || isOwner || subscribing) return;

    try {
      setSubscribing(true);

      const result = await toggleSubscription(channelData._id);

      // Adjust this field if your API uses a different response shape.
      const subscribed = result?.isSubscribed ?? result?.subscribed;

      if (typeof subscribed === "boolean") {
        setChannelData((previous) =>
          previous ? { ...previous, isSubscribed: subscribed } : previous,
        );

        setStats((previous) => ({
          ...previous,
          subscribers: Math.max(
            0,
            previous.subscribers + (subscribed ? 1 : -1),
          ),
        }));
      }
    } catch (err) {
      console.error("Failed to toggle subscription:", err);

      setError(err.response?.data?.message || "Unable to update subscription.");
    } finally {
      setSubscribing(false);
    }
  }, [user, channelData, isOwner, subscribing]);

  if (authLoading || loading) {
    return <ChannelLoading />;
  }

  if (!channelData) {
    return (
      <div className="min-h-screen bg-[#08090b] px-6 py-12 text-white">
        <p role="alert" className="text-sm text-red-400">
          {error || "Channel not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">
        <ChannelHeader
          channel={channel}
          stats={stats}
          formatCount={formatCount}
          isOwner={isOwner}
          isSubscribed={Boolean(channelData.isSubscribed)}
          onSubscribe={handleSubscribe}
          subscribing={subscribing}
        />

        <ChannelTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {error && (
          <div
            role="alert"
            className="
              mt-8 rounded-xl border border-red-500/20
              bg-red-500/10 px-4 py-3 text-sm text-red-400
            "
          >
            {error}
          </div>
        )}

        {activeTab === "Videos" && (
          <ChannelVideos
            videos={videos}
            channel={channel}
            formatCount={formatCount}
            isOwner={isOwner}
          />
        )}

        {activeTab === "Tweets" && (
          <section className="mt-8 text-sm text-gray-500">
            Tweets coming soon.
          </section>
        )}

        {activeTab === "Playlists" && (
          <ChannelPlaylists
            playlists={playlists}
            channel={channel}
            isOwner={isOwner}
          />
        )}

        {activeTab === "About" && (
          <ChannelAbout about={channelData.about || ""} isOwner={isOwner} />
        )}
      </main>
    </div>
  );
}

export default UserChannel;

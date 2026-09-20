import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Check, UsersRound } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

import ChannelLoading from "../components/channel/ChannelLoading.jsx";
import ChannelTabs from "../components/channel/ChannelTabs.jsx";
import ChannelHeader from "../components/channel/ChannelHeader.jsx";
import ChannelVideos from "../components/channel/ChannelVideos.jsx";
import ChannelAbout from "../components/channel/ChannelAbout.jsx";

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatCount = (value) => numberFormatter.format(value || 0);

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

  const channel = useMemo(
    () => ({
      name:
        channelData?.fullName ||
        channelData?.username ||
        "",

      username: channelData?.username
        ? `@${channelData.username}`
        : "",

      avatar: channelData?.avatar,

      cover: channelData?.coverImage,

      about: channelData?.about || "",

      initial: (
        channelData?.fullName ||
        channelData?.username ||
        "?"
      )
        .charAt(0)
        .toUpperCase(),
    }),
    [channelData],
  );

  useEffect(() => {
    if (authLoading || !username) return;

    const controller = new AbortController();

    const fetchChannelData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          channelResponse,
          videosResponse,
        ] = await Promise.all([
          api.get(`/users/c/${username}`, {
            signal: controller.signal,
          }),

          api.get(`/videos/c/${username}/videos`, {
            signal: controller.signal,
          }),
        ]);

        const channelDataResponse =
          channelResponse.data.data;

        const videosData =
          videosResponse.data.data;

        setChannelData(channelDataResponse);

        setSubscribed(
          channelDataResponse?.isSubscribed || false,
        );

        setStats({
          subscribers:
            channelDataResponse?.subscribersCount || 0,

          totalVideos:
            videosData?.totalDocs || 0,
        });

        setVideos(
          videosData?.docs || [],
        );
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error(
          "Failed to fetch channel data:",
          err,
        );

        setError(
          err.response?.data?.message ||
            "Unable to load channel information.",
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
    if (
      !user ||
      !channelData?._id ||
      subscribeLoading
    ) {
      return;
    }

    if (user._id === channelData._id) {
      return;
    }

    try {
      setSubscribeLoading(true);
      setError("");

      const response = await api.post(
        `/subscriptions/c/${channelData._id}`,
      );

      const data = response.data.data;

      const isNowSubscribed =
        data?.isSubscribed ?? !subscribed;

      setSubscribed(isNowSubscribed);

      setStats((current) => ({
        ...current,
        subscribers: Math.max(
          0,
          current.subscribers +
            (isNowSubscribed ? 1 : -1),
        ),
      }));
    } catch (err) {
      console.error(
        "Failed to toggle subscription:",
        err,
      );

      setError(
        err.response?.data?.message ||
          "Unable to update subscription.",
      );
    } finally {
      setSubscribeLoading(false);
    }
  }, [
    user,
    channelData,
    subscribeLoading,
    subscribed,
  ]);

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
            <h1 className="text-xl font-semibold">
              Channel not found
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {error ||
                "Unable to find this channel."}
            </p>
          </div>
        </main>
      </div>
    );
  }

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
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={subscribeLoading}
                className={`
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  transition
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  ${
                    subscribed
                      ? "bg-gray-800 text-white hover:bg-gray-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }
                `}
              >
                {subscribed ? (
                  <>
                    <Check size={17} />
                    Subscribed
                  </>
                ) : (
                  <>
                    <UsersRound size={17} />
                    Subscribe
                  </>
                )}
              </button>
            )
          }
        />

        {/* Tabs */}
        <ChannelTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

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
          <ChannelAbout
            about={channel.about}
            isOwner={isOwner}
          />
        )}
      </main>
    </div>
  );
}

export default UserChannel;
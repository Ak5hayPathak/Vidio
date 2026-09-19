import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

import ChannelLoading from "../components/channel/ChannelLoading.jsx";
import ChannelLoggedOut from "../components/channel/ChannelLoggedOut.jsx";
import ChannelHeader from "../components/channel/ChannelHeader.jsx";
import ChannelTabs from "../components/channel/ChannelTabs.jsx";
import ChannelVideos from "../components/channel/ChannelVideos.jsx";
import ChannelAbout from "../components/channel/ChannelAbout.jsx";

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatCount = (value) => numberFormatter.format(value || 0);

function Channel() {
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    subscribers: 0,
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
  });

  const [videos, setVideos] = useState([]);
  const [about, setAbout] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Videos");

  const channel = useMemo(
    () => ({
      name: user?.fullName || user?.username || "",
      username: user?.username ? `@${user.username}` : "",
      avatar: user?.avatar,
      cover: user?.coverImage,
      about,
      initial: (user?.fullName || user?.username || "?")
        .charAt(0)
        .toUpperCase(),
    }),
    [user, about],
  );

  useEffect(() => {
    if (authLoading || !user) return;

    setAbout(user.about || "");

    const controller = new AbortController();

    const fetchChannelData = async () => {
      try {
        setLoading(true);
        setError("");

        const [statsResponse, videosResponse] = await Promise.all([
          api.get("/dashboard/stats", {
            signal: controller.signal,
          }),
          api.get("/dashboard/videos", {
            signal: controller.signal,
          }),
        ]);

        setStats(statsResponse.data.data);
        setVideos(videosResponse.data.data.docs || []);
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Failed to fetch channel data:", err);

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
  }, [user, authLoading]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleAboutUpdate = useCallback((updatedAbout) => {
    setAbout(updatedAbout);
  }, []);

  if (authLoading || loading) {
    return <ChannelLoading />;
  }

  if (!user) {
    return <ChannelLoggedOut />;
  }

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">
        <ChannelHeader
          channel={channel}
          stats={stats}
          formatCount={formatCount}
        />

        <ChannelTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

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

        {activeTab === "Videos" && (
          <ChannelVideos
            videos={videos}
            channel={channel}
            formatCount={formatCount}
          />
        )}

        {activeTab === "Tweets" && (
          <section className="mt-8 text-sm text-gray-500">
            Tweets coming soon.
          </section>
        )}

        {activeTab === "Playlists" && (
          <section className="mt-8 text-sm text-gray-500">
            Playlists coming soon.
          </section>
        )}

        {activeTab === "About" && (
          <ChannelAbout
            about={about}
            onAboutUpdate={handleAboutUpdate}
          />
        )}
      </main>
    </div>
  );
}

export default Channel;
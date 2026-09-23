import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";

import {
  getChannelStats,
  getChannelVideos,
} from "../channel.service.js";

import ChannelLoading from "../components/ChannelLoading.jsx";
import ChannelLoggedOut from "../components/ChannelLoggedOut.jsx";
import ChannelHeader from "../components/ChannelHeader.jsx";
import ChannelTabs from "../components/ChannelTabs.jsx";
import ChannelVideos from "../components/ChannelVideos.jsx";
import ChannelAbout from "../components/ChannelAbout.jsx";

import { formatCount, formatChannel } from "../channel.utils.js";

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

        const [stats, videos] = await Promise.all([
          getChannelStats(controller.signal),
          getChannelVideos(controller.signal),
        ]);

        setStats(stats);
        setVideos(videos);
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
          isOwner={true}
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
            isOwner={true}
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
            isOwner={true}
          />
        )}
      </main>
    </div>
  );
}

export default Channel;
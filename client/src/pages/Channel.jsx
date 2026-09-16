import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VideoCard from "../components/home/VideoCard.jsx";
import { useAuth } from "../components/context/AuthContext.jsx";
import api from "../services/api.js";

const Channel = () => {
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    subscribers: 0,
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
  });

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchChannelData = async () => {
      try {
        setLoading(true);
        setError("");

        const [statsResponse, videosResponse] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/videos"),
        ]);

        setStats(statsResponse.data.data);

        setVideos(videosResponse.data.data.docs || []);
      } catch (error) {
        console.error("Failed to fetch channel data:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load channel information.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#08090b] text-white">
        <p className="text-sm text-gray-400">Loading channel...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#08090b] px-6 text-center text-white">
        <div>
          <h1 className="text-xl font-semibold">
            Please log in to view your channel.
          </h1>

          <Link
            to="/login"
            className="
              mt-5
              inline-block
              rounded-xl
              bg-red-600
              px-5
              py-2.5
              text-sm
              font-semibold
              transition
              hover:bg-red-700
            "
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const channel = {
    name: user.fullName || user.username,
    username: user.username ? `@${user.username}` : "",
    avatar: user.avatar,
    cover: user.coverImage,
  };

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">
        {/* Channel Header */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111318]">
          {/* Cover */}
          <div className="relative h-48 overflow-hidden sm:h-56 lg:h-64">
            {channel.cover ? (
              <img
                src={channel.cover}
                alt="Channel cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[#181a20]" />
            )}

            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Channel Info */}
          <div className="relative px-6 pb-6 sm:px-8">
            {/* Avatar */}
            <div className="-mt-14 mb-5">
              {channel.avatar ? (
                <img
                  src={channel.avatar}
                  alt={channel.name}
                  className="
                    h-28
                    w-28
                    rounded-full
                    border-4
                    border-[#111318]
                    object-cover
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-28
                    w-28
                    items-center
                    justify-center
                    rounded-full
                    border-4
                    border-[#111318]
                    bg-gray-800
                    text-3xl
                    font-semibold
                  "
                >
                  {channel.name}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              {/* Details */}
              <div className="max-w-2xl">
                <h1 className="text-2xl font-bold sm:text-3xl">
                  {channel.name}
                </h1>

                <p className="mt-1 text-sm text-gray-400">{channel.username}</p>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-400">
                  <span>
                    <strong className="text-white">{stats.subscribers}</strong>{" "}
                    subscribers
                  </span>

                  <span>
                    <strong className="text-white">{stats.totalVideos}</strong>{" "}
                    videos
                  </span>

                  <span>
                    <strong className="text-white">{stats.totalViews}</strong>{" "}
                    views
                  </span>

                  <span>
                    <strong className="text-white">{stats.totalLikes}</strong>{" "}
                    likes
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 gap-3">
                <Link
                  to="/edit-channel"
                  className="
                    rounded-xl
                    bg-red-600
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    transition
                    hover:bg-red-700
                  "
                >
                  Edit Channel
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Channel Navigation */}
        <div className="mt-8 border-b border-white/10">
          <div className="flex gap-8">
            <button
              className="
                border-b-2
                border-red-600
                px-1
                pb-4
                text-sm
                font-semibold
                text-red-500
              "
            >
              Videos
            </button>

            <button
              className="
                px-1
                pb-4
                text-sm
                font-medium
                text-gray-400
                transition
                hover:text-white
              "
            >
              Tweets
            </button>

            <button
              className="
                px-1
                pb-4
                text-sm
                font-medium
                text-gray-400
                transition
                hover:text-white
              "
            >
              About
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
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
        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Videos</h2>

              <p className="mt-1 text-sm text-gray-500">
                Videos uploaded to your channel
              </p>
            </div>

            <Link
              to="/upload"
              className="
                rounded-xl
                border
                border-white/10
                bg-[#111318]
                px-4
                py-2
                text-sm
                font-medium
                text-gray-300
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              Upload Video
            </Link>
          </div>

          {videos.length > 0 ? (
            <div
              className="
                grid
                grid-cols-1
                gap-x-5
                gap-y-8
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              "
            >
              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={{
                    id: video._id,
                    thumbnail: video.thumbnail,
                    title: video.title,
                    channel: channel.name,
                    views: `${video.views || 0} views`,
                    uploaded: new Date(video.createdAt).toLocaleDateString(),
                    duration: video.duration,
                  }}
                />
              ))}
            </div>
          ) : (
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
                  mb-4
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-red-600/10
                  text-2xl
                  text-red-500
                "
              >
                ▶
              </div>

              <h2 className="text-xl font-semibold">No videos yet</h2>

              <p className="mt-2 max-w-md text-sm text-gray-500">
                Upload your first video and start building your channel.
              </p>

              <Link
                to="/upload"
                className="
                  mt-6
                  rounded-xl
                  bg-red-600
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  transition
                  hover:bg-red-700
                "
              >
                Upload Video
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Channel;

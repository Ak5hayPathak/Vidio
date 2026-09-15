import { Link } from "react-router-dom";
import VideoCard from "../components/home/VideoCard.jsx";

const Channel = () => {
  const channel = {
    name: "John Doe",
    username: "@johndoe",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    cover:
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85",
    subscribers: "1.2K",
    videos: 24,
    description:
      "Welcome to my channel! I create videos about programming, web development, technology, and software engineering.",
  };

  const videos = [
    {
      id: 1,
      thumbnail:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      title: "Building a Full Stack MERN Application",
      channel: channel.name,
      views: "12K views",
      uploaded: "2 days ago",
      duration: "18:42",
    },
    {
      id: 2,
      thumbnail:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      title: "Understanding Backend Architecture",
      channel: channel.name,
      views: "8.4K views",
      uploaded: "5 days ago",
      duration: "24:15",
    },
    {
      id: 3,
      thumbnail:
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb",
      title: "Advanced JavaScript Concepts",
      channel: channel.name,
      views: "15K views",
      uploaded: "1 week ago",
      duration: "31:20",
    },
    {
      id: 4,
      thumbnail:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
      title: "How Modern Web Applications Work",
      channel: channel.name,
      views: "6.2K views",
      uploaded: "2 weeks ago",
      duration: "15:08",
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      

      <div className="flex">
        

        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">
          {/* Channel Header */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111318]">
            {/* Cover */}
            <div className="relative h-48 overflow-hidden sm:h-56 lg:h-64">
              <img
                src={channel.cover}
                alt="Channel cover"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Channel Info */}
            <div className="relative px-6 pb-6 sm:px-8">
              {/* Avatar */}
              <div className="-mt-14 mb-5">
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
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                {/* Details */}
                <div className="max-w-2xl">
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    {channel.name}
                  </h1>

                  <p className="mt-1 text-sm text-gray-400">
                    {channel.username}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-400">
                    <span>
                      <strong className="text-white">
                        {channel.subscribers}
                      </strong>{" "}
                      subscribers
                    </span>

                    <span>
                      <strong className="text-white">
                        {channel.videos}
                      </strong>{" "}
                      videos
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-400">
                    {channel.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-3">
                  <button
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
                  </button>
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
                About
              </button>
            </div>
          </div>

          {/* Videos */}
          <section className="mt-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Videos
                </h2>

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
                    key={video.id}
                    video={video}
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

                <h2 className="text-xl font-semibold">
                  No videos yet
                </h2>

                <p className="mt-2 max-w-md text-sm text-gray-500">
                  Upload your first video and start building
                  your channel.
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
    </div>
  );
};

export default Channel;
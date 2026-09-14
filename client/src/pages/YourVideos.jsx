import { Link } from "react-router-dom";
import Navbar from "../components/home/Navbar.jsx";
import Sidebar from "../components/home/Sidebar.jsx";
import VideoCard from "../components/home/VideoCard.jsx";

const YourVideos = () => {
  const videos = [
    {
      id: 1,
      thumbnail:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      title: "Building a Full Stack MERN Application",
      channel: "John Doe",
      views: "12K views",
      uploaded: "2 days ago",
      duration: "18:42",
    },
    {
      id: 2,
      thumbnail:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      title: "Understanding Backend Architecture",
      channel: "John Doe",
      views: "8.4K views",
      uploaded: "5 days ago",
      duration: "24:15",
    },
    {
      id: 3,
      thumbnail:
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb",
      title: "Advanced JavaScript Concepts",
      channel: "John Doe",
      views: "15K views",
      uploaded: "1 week ago",
      duration: "31:20",
    },
    {
      id: 4,
      thumbnail:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
      title: "How Modern Web Applications Work",
      channel: "John Doe",
      views: "6.2K views",
      uploaded: "2 weeks ago",
      duration: "15:08",
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Your Videos
              </h1>

              <p className="mt-2 text-gray-400">
                Manage the videos you've uploaded
              </p>
            </div>

            <Link
              to="/upload"
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
              Upload Video
            </Link>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-[#111318]
                p-5
              "
            >
              <p className="text-sm text-gray-400">
                Total Videos
              </p>

              <p className="mt-2 text-3xl font-bold">
                {videos.length}
              </p>
            </div>

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-[#111318]
                p-5
              "
            >
              <p className="text-sm text-gray-400">
                Published
              </p>

              <p className="mt-2 text-3xl font-bold">
                {videos.length}
              </p>
            </div>

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-[#111318]
                p-5
              "
            >
              <p className="text-sm text-gray-400">
                Total Views
              </p>

              <p className="mt-2 text-3xl font-bold">
                41.6K
              </p>
            </div>
          </div>

          {/* Videos Header */}
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Uploaded Videos
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              All videos uploaded to your channel
            </p>
          </div>

          {/* Videos */}
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
                <div key={video.id} className="group relative">
                  <VideoCard video={video} />

                  {/* Manage button */}
                  <Link
                    to={`/videos/${video.id}/edit`}
                    className="
                      absolute
                      right-2
                      top-2
                      rounded-lg
                      bg-black/80
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      text-white
                      opacity-0
                      transition
                      group-hover:opacity-100
                      hover:bg-red-600
                    "
                  >
                    Manage
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
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
                  text-xl
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

        </main>
      </div>
    </div>
  );
};

export default YourVideos;
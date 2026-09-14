import Navbar from "../components/home/Navbar.jsx";
import Sidebar from "../components/home/Sidebar.jsx";
import VideoCard from "../components/home/VideoCard.jsx";

const LikedVideos = () => {
  const videos = [
    {
      id: 1,
      thumbnail:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      title: "Build a Full Stack MERN Application",
      channel: "Code Academy",
      views: "125K views",
      uploaded: "2 days ago",
      duration: "18:42",
    },
    {
      id: 2,
      thumbnail:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      title: "Understanding Backend Architecture",
      channel: "Dev World",
      views: "89K views",
      uploaded: "5 days ago",
      duration: "24:15",
    },
    {
      id: 3,
      thumbnail:
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb",
      title: "JavaScript Advanced Concepts",
      channel: "Programming Hub",
      views: "210K views",
      uploaded: "1 week ago",
      duration: "31:20",
    },
    {
      id: 4,
      thumbnail:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
      title: "How Modern Web Applications Work",
      channel: "Tech Explained",
      views: "64K views",
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
                Liked Videos
              </h1>

              <p className="mt-2 text-gray-400">
                Videos you've liked
              </p>
            </div>

            {videos.length > 0 && (
              <button
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
                Clear all
              </button>
            )}
          </div>

          {/* Count */}
          {videos.length > 0 && (
            <div className="mb-8">
              <p className="text-sm text-gray-500">
                {videos.length} liked videos
              </p>
            </div>
          )}

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
                ♡
              </div>

              <h2 className="text-xl font-semibold">
                No liked videos
              </h2>

              <p className="mt-2 max-w-md text-sm text-gray-500">
                Videos you like will appear here.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LikedVideos;
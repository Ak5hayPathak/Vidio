import { Link } from "react-router-dom";
import Navbar from "../components/navbar/Navbar.jsx";
import Sidebar from "../components/sidebar/Sidebar.jsx";

const Collab = () => {
  const playlists = [
    {
      id: 1,
      name: "Best Programming Resources",
      description: "Useful programming and backend development videos.",
      owner: "Alex",
      videos: 24,
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      visibility: "Public",
    },
    {
      id: 2,
      name: "Web Development",
      description: "Frontend and backend development tutorials.",
      owner: "John",
      videos: 18,
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      visibility: "Private",
    },
    {
      id: 3,
      name: "AI & Machine Learning",
      description: "Interesting AI and machine learning content.",
      owner: "Sarah",
      videos: 31,
      thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b",
      visibility: "Public",
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      

      <div className="flex">
        

        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Collab</h1>

            <p className="mt-2 text-gray-400">Playlists you collaborate on</p>
          </div>

          {/* Stats */}
          <div className="mb-8 rounded-2xl border border-white/10 bg-[#111318] p-6">
            <p className="text-sm text-gray-400">Collaborative playlists</p>

            <p className="mt-2 text-3xl font-bold">{playlists.length}</p>
          </div>

          {/* Playlists */}
          {playlists.length > 0 ? (
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Your collaborations</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Playlists where you have collaboration access
                </p>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-5
                  sm:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                "
              >
                {playlists.map((playlist) => (
                  <Link
                    key={playlist.id}
                    to={`/playlists/${playlist.id}`}
                    className="
                      group
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/10
                      bg-[#111318]
                      transition
                      hover:border-red-600/40
                    "
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={playlist.thumbnail}
                        alt={playlist.name}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition
                          duration-300
                          group-hover:scale-105
                        "
                      />

                      {/* Video count */}
                      <div
                        className="
                          absolute
                          bottom-2
                          right-2
                          rounded
                          bg-black/80
                          px-2
                          py-1
                          text-xs
                          font-medium
                        "
                      >
                        {playlist.videos} videos
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3
                        className="
                          line-clamp-1
                          font-semibold
                          transition
                          group-hover:text-red-500
                        "
                      >
                        {playlist.name}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                        {playlist.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                        <span>By {playlist.owner}</span>

                        <span>{playlist.visibility}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            /* Empty state */
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
                "
              >
                👥
              </div>

              <h2 className="text-xl font-semibold">No collaborations yet</h2>

              <p className="mt-2 max-w-md text-sm text-gray-500">
                When someone invites you to collaborate on a playlist, it will
                appear here.
              </p>

              <Link
                to="/playlists"
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
                View Playlists
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Collab;

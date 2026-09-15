import Navbar from "../components/home/Navbar.jsx";
import Sidebar from "../components/home/Sidebar.jsx";
import { Link } from "react-router-dom";

const playlists = [
  {
    id: 1,
    name: "JavaScript Mastery",
    description: "Everything I need to learn JavaScript.",
    videos: 24,
    visibility: "Private",
    thumbnail:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479",
  },
  {
    id: 2,
    name: "Backend Development",
    description: "Node.js, Express, MongoDB and backend architecture.",
    videos: 18,
    visibility: "Public",
    thumbnail:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
  },
  {
    id: 3,
    name: "System Design",
    description: "System design concepts and real-world architectures.",
    videos: 12,
    visibility: "Private",
    thumbnail:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
  },
  {
    id: 4,
    name: "AI & Machine Learning",
    description: "Interesting AI and machine learning videos.",
    videos: 31,
    visibility: "Public",
    thumbnail:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995",
  },
  {
    id: 5,
    name: "Project Ideas",
    description: "Projects I want to build someday.",
    videos: 15,
    visibility: "Private",
    thumbnail:
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
  },
  {
    id: 6,
    name: "Tech Talks",
    description: "Interesting talks from developers and engineers.",
    videos: 20,
    visibility: "Public",
    thumbnail:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998",
  },
];

function Playlists() {
  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      

      <div className="flex">
        

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">

          {/* Page heading */}
          <div className="mb-8 flex items-center justify-between">

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Playlists
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Organize and manage your favorite videos
              </p>
            </div>


            {/* Create playlist */}
            <button
              className="
                flex
                items-center
                gap-2
                rounded-lg
                bg-red-600
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-red-700
              "
            >
              <span className="text-lg leading-none">
                +
              </span>

              <span className="hidden sm:inline">
                Create playlist
              </span>
            </button>

          </div>


          {/* Playlist count */}
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              {playlists.length} playlists
            </p>
          </div>


          {/* Playlist grid */}
          <section>
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
                  className="group"
                >

                  {/* Thumbnail */}
                  <div
                    className="
                      relative
                      aspect-video
                      overflow-hidden
                      rounded-xl
                      bg-[#111318]
                    "
                  >
                    <img
                      src={`${playlist.thumbnail}?auto=format&fit=crop&w=800&q=80`}
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

                    {/* Video count overlay */}
                    <div
                      className="
                        absolute
                        bottom-0
                        right-0
                        flex
                        items-center
                        gap-1.5
                        rounded-tl-lg
                        bg-black/85
                        px-3
                        py-2
                        text-xs
                        font-medium
                        text-white
                      "
                    >
                      <span>☷</span>
                      {playlist.videos} videos
                    </div>
                  </div>


                  {/* Playlist information */}
                  <div className="mt-3">

                    {/* Title */}
                    <h2
                      className="
                        line-clamp-1
                        text-base
                        font-semibold
                        text-white
                        transition
                        group-hover:text-red-500
                      "
                    >
                      {playlist.name}
                    </h2>


                    {/* Description */}
                    <p
                      className="
                        mt-1
                        line-clamp-2
                        text-sm
                        leading-5
                        text-gray-500
                      "
                    >
                      {playlist.description}
                    </p>


                    {/* Metadata */}
                    <div
                      className="
                        mt-2
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-gray-500
                      "
                    >
                      <span>
                        {playlist.visibility}
                      </span>

                      <span>·</span>

                      <span>
                        {playlist.videos} videos
                      </span>
                    </div>

                  </div>

                </Link>
              ))}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

export default Playlists;
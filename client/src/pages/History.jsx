import Navbar from "../components/home/Navbar.jsx";
import Sidebar from "../components/sidebar/Sidebar.jsx";
import VideoCard from "../components/home/VideoCard.jsx";

const todayVideos = [
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    title: "Build a Modern Web Application from Scratch",
    channel: "Code Academy",
    views: "1.2M views",
    uploaded: "2 days ago",
    duration: "18:42",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    title: "JavaScript Backend Development — Complete Guide",
    channel: "Dev Mastery",
    views: "845K views",
    uploaded: "5 days ago",
    duration: "24:15",
  },
  {
    id: 3,
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    title: "How I Built a Full Stack Video Platform",
    channel: "Tech World",
    views: "532K views",
    uploaded: "1 week ago",
    duration: "31:27",
  },
];

const yesterdayVideos = [
  {
    id: 4,
    thumbnail:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
    title: "The Future of Artificial Intelligence",
    channel: "Future Labs",
    views: "2.4M views",
    uploaded: "3 days ago",
    duration: "12:08",
  },
  {
    id: 5,
    thumbnail:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420",
    title: "The Best Games You Need to Play in 2026",
    channel: "Game Central",
    views: "923K views",
    uploaded: "4 days ago",
    duration: "15:34",
  },
];

const earlierVideos = [
  {
    id: 6,
    thumbnail:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    title: "10 Programming Concepts Every Developer Should Know",
    channel: "Code Academy",
    views: "1.8M views",
    uploaded: "1 week ago",
    duration: "22:49",
  },
  {
    id: 7,
    thumbnail:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
    title: "How to Become a Better Software Engineer",
    channel: "Engineering Daily",
    views: "756K views",
    uploaded: "2 weeks ago",
    duration: "17:36",
  },
];

function History() {
  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      

      <div className="flex">
        

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">

          {/* Page heading */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                History
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Videos you've watched recently
              </p>
            </div>

            {/* Clear history */}
            <button
              className="
                hidden
                rounded-lg
                border
                border-white/10
                px-4
                py-2
                text-sm
                font-medium
                text-gray-400
                transition
                hover:border-red-600/40
                hover:bg-red-600/10
                hover:text-red-500
                sm:block
              "
            >
              Clear history
            </button>
          </div>


          {/* Today */}
          <section className="mb-10">
            <h2 className="mb-5 text-lg font-semibold">
              Today
            </h2>

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
              {todayVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                />
              ))}
            </div>
          </section>


          {/* Yesterday */}
          <section className="mb-10">
            <h2 className="mb-5 text-lg font-semibold">
              Yesterday
            </h2>

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
              {yesterdayVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                />
              ))}
            </div>
          </section>


          {/* Earlier */}
          <section className="mb-10">
            <h2 className="mb-5 text-lg font-semibold">
              Earlier
            </h2>

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
              {earlierVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                />
              ))}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

export default History;
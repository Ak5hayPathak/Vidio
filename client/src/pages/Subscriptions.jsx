import Navbar from "../components/navbar/Navbar.jsx";
import Sidebar from "../components/sidebar/Sidebar.jsx";
import VideoCard from "../components/home/VideoCard.jsx";

const channels = [
  {
    id: 1,
    name: "Code Academy",
    username: "@codeacademy",
    avatar: "C",
  },
  {
    id: 2,
    name: "Dev Mastery",
    username: "@devmastery",
    avatar: "D",
  },
  {
    id: 3,
    name: "Tech World",
    username: "@techworld",
    avatar: "T",
  },
  {
    id: 4,
    name: "Future Labs",
    username: "@futurelabs",
    avatar: "F",
  },
  {
    id: 5,
    name: "Game Central",
    username: "@gamecentral",
    avatar: "G",
  },
];

const videos = [
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
];

function Subscriptions() {
  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      

      <div className="flex">
        

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">

          {/* Page heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold sm:text-3xl">
              Subscriptions
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Latest videos from channels you follow
            </p>
          </div>


          {/* Subscribed channels */}
          <section className="mb-10">

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Your channels
              </h2>

              <button
                className="
                  text-sm
                  font-medium
                  text-red-500
                  transition
                  hover:text-red-400
                "
              >
                Manage
              </button>
            </div>


            <div
              className="
                flex
                gap-4
                overflow-x-auto
                pb-3
              "
            >
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="
                    flex
                    min-w-30
                    shrink-0
                    cursor-pointer
                    flex-col
                    items-center
                    rounded-2xl
                    border
                    border-white/5
                    bg-[#111318]
                    px-4
                    py-5
                    transition
                    hover:border-white/10
                    hover:bg-[#15171d]
                  "
                >

                  {/* Avatar */}
                  <div
                    className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-full
                      bg-red-600
                      text-xl
                      font-bold
                      text-white
                    "
                  >
                    {channel.avatar}
                  </div>


                  {/* Channel name */}
                  <p
                    className="
                      mt-3
                      max-w-full
                      truncate
                      text-sm
                      font-semibold
                    "
                  >
                    {channel.name}
                  </p>


                  <p className="mt-1 text-xs text-gray-500">
                    {channel.username}
                  </p>

                </div>
              ))}
            </div>
          </section>


          {/* Divider
          <div className="mb-6 border-t border-white/10" /> */}


          {/* Tabs */}
          {/* <div className="mb-6 flex gap-2">

            <button
              className="
                rounded-lg
                bg-red-600
                px-5
                py-2
                text-sm
                font-medium
                text-white
              "
            >
              All
            </button>

            <button
              className="
                rounded-lg
                bg-[#111318]
                px-5
                py-2
                text-sm
                font-medium
                text-gray-400
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              Videos
            </button>

            <button
              className="
                rounded-lg
                bg-[#111318]
                px-5
                py-2
                text-sm
                font-medium
                text-gray-400
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              Channels
            </button>

          </div> */}


          {/* Video grid */}
          {/* <section>
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
          </section> */}

        </main>
      </div>
    </div>
  );
}

export default Subscriptions;
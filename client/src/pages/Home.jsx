import VideoCard from "../components/home/VideoCard.jsx";

const videos = [
  {
    id: 1,
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    title: "Build a Modern Web Application from Scratch",
    channel: "Code Academy",
    views: "1.2M views",
    uploaded: "2 days ago",
    duration: "18:42",
  },
  {
    id: 2,
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    title: "JavaScript Backend Development — Complete Guide",
    channel: "Dev Mastery",
    views: "845K views",
    uploaded: "5 days ago",
    duration: "24:15",
  },
  {
    id: 3,
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    title: "How I Built a Full Stack Video Platform",
    channel: "Tech World",
    views: "532K views",
    uploaded: "1 week ago",
    duration: "31:27",
  },
  {
    id: 4,
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
    title: "The Future of Artificial Intelligence",
    channel: "Future Labs",
    views: "2.4M views",
    uploaded: "3 days ago",
    duration: "12:08",
  },
  {
    id: 5,
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
    title: "The Best Games You Need to Play in 2026",
    channel: "Game Central",
    views: "923K views",
    uploaded: "4 days ago",
    duration: "15:34",
  },
  {
    id: 6,
    thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618",
    title: "How Music Production Actually Works",
    channel: "Sound Lab",
    views: "674K views",
    uploaded: "1 week ago",
    duration: "20:11",
  },
  {
    id: 7,
    thumbnail: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    title: "10 Programming Concepts Every Developer Should Know",
    channel: "Programming Hub",
    views: "1.8M views",
    uploaded: "2 weeks ago",
    duration: "22:49",
  },
  {
    id: 8,
    thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
    title: "How to Become a Better Software Engineer",
    channel: "Engineering Daily",
    views: "756K views",
    uploaded: "3 days ago",
    duration: "17:36",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      

      <div className="flex">
        

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/* <CategoryBar /> */}

          <section className="mt-6">
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
          </section>
        </main>
      </div>
    </div>
  );
}

export default Home;
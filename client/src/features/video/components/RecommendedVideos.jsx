import { Link } from "react-router-dom";

function RecommendedVideos() {
  const videos = [
    {
      id: "1",
      title: "How HLS Video Streaming Works",
      channel: "Vidio Dev",
      views: "8.2K views",
    },
    {
      id: "2",
      title: "Building Background Video Processing",
      channel: "Backend Lab",
      views: "5.7K views",
    },
    {
      id: "3",
      title: "MongoDB Aggregation Explained",
      channel: "Code Daily",
      views: "14K views",
    },
  ];

  return (
    <aside className="hidden xl:block">
      <h2 className="mb-4 text-lg font-semibold">Recommended</h2>

      <div className="space-y-4">
        {videos.map((video) => (
          <Link
            key={video.id}
            to={`/watch/${video.id}`}
            className="group flex gap-3"
          >
            <div
              className="
                h-24
                w-40
                shrink-0
                rounded-lg
                bg-[#111318]
              "
            />

            <div className="min-w-0">
              <h3
                className="
                  line-clamp-2
                  text-sm
                  font-medium
                  leading-5
                  text-gray-200
                  transition
                  group-hover:text-white
                "
              >
                {video.title}
              </h3>

              <p className="mt-1 text-xs text-gray-500">{video.channel}</p>

              <p className="text-xs text-gray-500">{video.views}</p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}

export default RecommendedVideos;

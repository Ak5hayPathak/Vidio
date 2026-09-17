import { Link } from "react-router-dom";
import VideoCard from "../../components/home/VideoCard.jsx";
import EmptyVideos from "./EmptyVideos.jsx";

function ChannelVideos({ videos, channel, formatCount }) {
  return (
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
                views: `${formatCount(video.views)} views`,
                uploaded: new Date(video.createdAt).toLocaleDateString(),
                duration: video.duration,
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyVideos />
      )}
    </section>
  );
}

export default ChannelVideos;
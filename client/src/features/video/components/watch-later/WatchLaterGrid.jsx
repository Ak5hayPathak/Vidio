import VideoCard from "../../../../components/videoCard/VideoCard.jsx";
import EmptyWatchLater from "./EmptyWatchLater.jsx";

function WatchLaterGrid({ videos, onRemove, removingVideoId }) {
  if (videos.length === 0) {
    return <EmptyWatchLater />;
  }

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          variant="watchLater"
          onRemove={onRemove}
          removing={removingVideoId === video.id}
        />
      ))}
    </div>
  );
}

export default WatchLaterGrid;

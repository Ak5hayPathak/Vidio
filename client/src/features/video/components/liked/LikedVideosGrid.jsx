import VideoCard from "../../../../components/videoCard/VideoCard.jsx";
import EmptyLikedVideos from "./EmptyLikedVideos.jsx";

function LikedVideosGrid({ videos, onRemove, removingVideoId }) {
  if (videos.length === 0) {
    return <EmptyLikedVideos />;
  }

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          variant="liked"
          onRemove={onRemove}
          removing={removingVideoId === video.id}
        />
      ))}
    </div>
  );
}

export default LikedVideosGrid;

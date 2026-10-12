import { RefreshCw } from "lucide-react";

import VideoCard from "../../../../components/videoCard/VideoCard.jsx";
import PlaylistEmptyState from "./PlaylistEmptyState.jsx";

function PlaylistVideosSection({
  videos,
  totalVideos,
  isOwner,
  refreshing,
  removingVideoId,
  onRefresh,
  onRemoveVideo,
}) {
  return (
    <div className="mt-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Videos</h2>

          <p className="mt-1 text-sm text-gray-500">
            {totalVideos} {totalVideos === 1 ? "video" : "videos"} in this
            playlist
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh playlist"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {videos.length === 0 ? (
        <PlaylistEmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <div key={video.id} className="min-w-0">
              <VideoCard
                video={video}
                variant={isOwner ? "playlist" : "default"}
                isOwner={false}
                onRemove={isOwner ? onRemoveVideo : undefined}
                removing={removingVideoId === String(video.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaylistVideosSection;

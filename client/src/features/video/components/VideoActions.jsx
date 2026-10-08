import { useEffect, useState } from "react";
import {
  Heart,
  MoreHorizontal,
  Share2,
} from "lucide-react";

import { toggleVideoLike } from "../video.service.js";

function VideoActions({ video }) {
  const [liked, setLiked] = useState(video.isLiked || false);
  const [likesCount, setLikesCount] = useState(video.likesCount || 0);

  // Keep local state synchronized when a different video is loaded
  useEffect(() => {
    setLiked(video.isLiked || false);
    setLikesCount(video.likesCount || 0);
  }, [video._id, video.isLiked, video.likesCount]);

  const handleLike = async () => {
    const previousLiked = liked;

    // Optimistic UI update
    setLiked(!previousLiked);

    setLikesCount((prev) =>
      previousLiked ? prev - 1 : prev + 1
    );

    try {
      await toggleVideoLike(video._id);
    } catch (error) {
      // Revert UI if the request fails
      setLiked(previousLiked);

      setLikesCount((prev) =>
        previousLiked ? prev + 1 : prev - 1
      );

      console.error("Failed to toggle video like:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Like */}
      <button
        type="button"
        onClick={handleLike}
        className="
          flex
          items-center
          gap-2
          rounded-full
          border
          border-white/10
          bg-[#111318]
          px-4
          py-2
          text-sm
          font-medium
          text-gray-200
          transition
          hover:border-white/20
          hover:bg-white/5
        "
      >
        <Heart
          size={17}
          fill={liked ? "currentColor" : "none"}
          className={liked ? "text-red-500" : "text-gray-200"}
        />

        <span className={liked ? "text-red-500" : "text-gray-200"}>
          {likesCount.toLocaleString()}
        </span>
      </button>

      {/* Share */}
      <button
        type="button"
        className="
          flex
          items-center
          gap-2
          rounded-full
          border
          border-white/10
          bg-[#111318]
          px-4
          py-2
          text-sm
          font-medium
          text-gray-200
          transition
          hover:border-white/20
          hover:bg-white/5
        "
      >
        <Share2 size={17} />
        Share
      </button>

      {/* More */}
      <button
        type="button"
        title="More"
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          border
          border-white/10
          bg-[#111318]
          text-gray-400
          transition
          hover:bg-white/5
          hover:text-white
        "
      >
        <MoreHorizontal size={19} />
      </button>
    </div>
  );
}

export default VideoActions;

import {
  Heart,
  MoreHorizontal,
  Share2,
} from "lucide-react";

function VideoActions({ video }) {
  return (
    <div className="flex items-center gap-2">
      {/* Like */}
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
        <Heart
          size={17}
          fill={video.isLiked ? "currentColor" : "none"}
          className={video.isLiked ? "text-red-500" : ""}
        />

        {video.likesCount?.toLocaleString() || 0}
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
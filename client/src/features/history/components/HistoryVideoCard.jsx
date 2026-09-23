import { Trash2 } from "lucide-react";

import VideoCard from "../../video/components/VideoCard.jsx";
import { formatHistoryVideo } from "../history.utils.js";

function HistoryVideoCard({ item, onRemove }) {
  const video = formatHistoryVideo(item);

  return (
    <div className="relative">
      <VideoCard video={video} />

      <button
        type="button"
        onClick={() => onRemove(item.video._id)}
        title="Remove from history"
        className="
          absolute
          right-2
          top-2
          z-10
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          bg-black/70
          text-gray-400
          backdrop-blur
          transition
          hover:bg-red-600
          hover:text-white
        "
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export default HistoryVideoCard;
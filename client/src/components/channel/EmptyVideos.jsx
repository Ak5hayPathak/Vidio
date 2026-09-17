import { Play } from "lucide-react";
import { Link } from "react-router-dom";

function EmptyVideos() {
  return (
    <div
      className="
        flex
        min-h-80
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-white/10
        bg-[#111318]
        px-6
        text-center
      "
    >
      <div
        className="
          mb-4
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          bg-red-600/10
          text-red-500
        "
      >
        <Play size={24} />
      </div>

      <h2 className="text-xl font-semibold">No videos yet</h2>

      <p className="mt-2 max-w-md text-sm text-gray-500">
        Upload your first video and start building your channel.
      </p>

      <Link
        to="/upload"
        className="
          mt-6
          rounded-xl
          bg-red-600
          px-5
          py-2.5
          text-sm
          font-semibold
          transition
          hover:bg-red-700
        "
      >
        Upload Video
      </Link>
    </div>
  );
}

export default EmptyVideos;
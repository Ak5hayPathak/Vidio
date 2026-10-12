import { Link } from "react-router-dom";
import { VideoOff } from "lucide-react";

function PlaylistEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#111214]/60 px-5 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-gray-500">
        <VideoOff size={30} />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">
        This playlist is empty
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
        Add videos to this playlist using the options menu on any video. They
        will appear here.
      </p>

      <Link
        to="/"
        className="mt-5 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
      >
        Explore videos
      </Link>
    </div>
  );
}

export default PlaylistEmptyState;

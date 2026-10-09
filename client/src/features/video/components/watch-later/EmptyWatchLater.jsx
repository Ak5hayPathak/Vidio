import { Clock, Compass } from "lucide-react";
import { Link } from "react-router-dom";

function EmptyWatchLater() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <Clock size={30} className="text-gray-400" />
      </div>

      <h2 className="text-lg font-semibold text-white">
        Your Watch Later list is empty
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
        Save videos you want to watch later, and they’ll appear here.
      </p>

      <Link
        to="/"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#CE2029] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
      >
        <Compass size={16} />
        Explore videos
      </Link>
    </div>
  );
}

export default EmptyWatchLater;

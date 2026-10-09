import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

function EmptyLikedVideos() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#111318] px-6 py-12 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <Heart size={30} className="text-gray-400" />
      </div>

      <h2 className="text-lg font-semibold text-white">No liked videos yet</h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
        Videos you like will appear here, making them easy to find again.
      </p>

      <Link
        to="/"
        className="mt-6 rounded-xl bg-[#CE2029] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Explore Videos
      </Link>
    </div>
  );
}

export default EmptyLikedVideos;

import { ListVideo, Plus } from "lucide-react";

function PlaylistEmptyState({ onCreatePlaylist }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
      {/* Icon */}
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
        <ListVideo size={36} strokeWidth={1.5} className="text-gray-400" />
      </div>

      {/* Heading */}
      <h2 className="text-lg font-semibold text-white">
        Your playlists start here
      </h2>

      {/* Description */}
      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
        Save videos into playlists to organize your favorites, keep track of
        what you want to watch, and find everything easily.
      </p>

      {/* Create playlist button */}
      <button
        type="button"
        onClick={onCreatePlaylist}
        className="
          mt-6
          inline-flex
          items-center
          gap-2
          rounded-full
          bg-red-600
          px-5
          py-2.5
          text-sm
          font-medium
          text-white
          transition-colors
          hover:bg-red-700
          focus:outline-none
          focus:ring-2
          focus:ring-red-500
          focus:ring-offset-2
          focus:ring-offset-[#08090b]
        "
      >
        <Plus size={18} />
        Create playlist
      </button>
    </div>
  );
}

export default PlaylistEmptyState;

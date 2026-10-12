import { ListVideo, RefreshCw } from "lucide-react";

function PlaylistError({ error, onRetry, onBack }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-gray-500">
        <ListVideo size={30} />
      </div>

      <h1 className="mt-5 text-xl font-semibold text-white">
        Unable to load playlist
      </h1>

      <p role="alert" className="mt-2 text-sm text-gray-400">
        {error}
      </p>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
        >
          <RefreshCw size={16} />
          Try again
        </button>

        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-gray-300 transition hover:bg-white/5"
        >
          Back to playlists
        </button>
      </div>
    </div>
  );
}

export default PlaylistError;

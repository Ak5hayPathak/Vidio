import { useState } from "react";
import { X, Globe, LockKeyhole, ListVideo, LoaderCircle } from "lucide-react";

function CreatePlaylistDialog({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Playlist name is required.");
      return;
    }

    try {
      setLoading(true);

      await onCreate({
        name: trimmedName,
        description: description.trim(),
        isPublic,
      });

      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create playlist. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-playlist-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#111214] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-500">
              <ListVideo size={21} />
            </div>

            <h2
              id="create-playlist-title"
              className="text-lg font-semibold text-white"
            >
              Create playlist
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {/* Name */}
          <div>
            <label
              htmlFor="playlist-name"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Playlist name <span className="text-red-500">*</span>
            </label>

            <input
              id="playlist-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Give your playlist a name"
              maxLength={100}
              required
              autoFocus
              disabled={loading}
              className="w-full rounded-lg border border-white/10 bg-[#08090b] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-red-500 disabled:opacity-60"
            />

            <p className="mt-1.5 text-right text-xs text-gray-500">
              {name.length}/100
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="playlist-description"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Description
              <span className="ml-2 font-normal text-gray-500">(Optional)</span>
            </label>

            <textarea
              id="playlist-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this playlist about?"
              rows={3}
              maxLength={500}
              disabled={loading}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#08090b] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-red-500 disabled:opacity-60"
            />

            <p className="mt-1.5 text-right text-xs text-gray-500">
              {description.length}/500
            </p>
          </div>

          {/* Visibility */}
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-gray-200">
              Visibility
            </legend>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setIsPublic(true)}
                aria-pressed={isPublic}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                  isPublic
                    ? "border-red-500 bg-red-500/5"
                    : "border-white/10 bg-[#08090b] hover:border-white/20"
                }`}
              >
                <Globe
                  size={19}
                  className={isPublic ? "text-red-500" : "text-gray-400"}
                />

                <div>
                  <p className="text-sm font-medium text-white">Public</p>
                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Anyone can discover this playlist.
                  </p>
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => setIsPublic(false)}
                aria-pressed={!isPublic}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                  !isPublic
                    ? "border-red-500 bg-red-500/5"
                    : "border-white/10 bg-[#08090b] hover:border-white/20"
                }`}
              >
                <LockKeyhole
                  size={19}
                  className={!isPublic ? "text-red-500" : "text-gray-400"}
                />

                <div>
                  <p className="text-sm font-medium text-white">Private</p>
                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Only you can access this playlist.
                  </p>
                </div>
              </button>
            </div>
          </fieldset>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <LoaderCircle size={16} className="animate-spin" />}
              {loading ? "Creating..." : "Create playlist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePlaylistDialog;

import { useEffect, useState } from "react";
import { Globe, Lock, Pencil, X } from "lucide-react";

function EditPlaylistDialog({ playlist, onClose, onUpdate }) {
  const [name, setName] = useState(playlist?.name || "");
  const [description, setDescription] = useState(playlist?.description || "");
  const [isPublic, setIsPublic] = useState(playlist?.isPublic ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, loading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Please enter a playlist name.");
      return;
    }

    setLoading(true);

    try {
      await onUpdate({
        name: trimmedName,
        description: trimmedDescription,
        isPublic,
      });

      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Couldn't update the playlist. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-playlist-title"
        className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#111214] shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-500">
              <Pencil size={20} />
            </div>

            <div>
              <h2
                id="edit-playlist-title"
                className="text-lg font-semibold text-white"
              >
                Update playlist
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                Change your playlist details.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div>
            <label
              htmlFor="edit-playlist-name"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Playlist name <span className="text-red-500">*</span>
            </label>

            <input
              id="edit-playlist-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
              autoFocus
              placeholder="Give your playlist a name"
              className="w-full rounded-xl border border-white/10 bg-[#08090b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-red-500"
            />

            <p className="mt-1.5 text-right text-xs text-gray-500">
              {name.length}/100
            </p>
          </div>

          <div>
            <label
              htmlFor="edit-playlist-description"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Description
            </label>

            <textarea
              id="edit-playlist-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder="What is this playlist about?"
              className="w-full resize-y rounded-xl border border-white/10 bg-[#08090b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-red-500"
            />

            <p className="mt-1.5 text-right text-xs text-gray-500">
              {description.length}/500
            </p>
          </div>

          {/* Visibility */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-200">
              Visibility
            </legend>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                aria-pressed={isPublic}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                  isPublic
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/10 bg-[#08090b] hover:border-white/20"
                }`}
              >
                <Globe
                  size={19}
                  className={isPublic ? "text-red-400" : "text-gray-400"}
                />

                <div>
                  <p className="text-sm font-medium text-white">Public</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Anyone can view
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                aria-pressed={!isPublic}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                  !isPublic
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/10 bg-[#08090b] hover:border-white/20"
                }`}
              >
                <Lock
                  size={19}
                  className={!isPublic ? "text-red-400" : "text-gray-400"}
                />

                <div>
                  <p className="text-sm font-medium text-white">Private</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Only you can view
                  </p>
                </div>
              </button>
            </div>
          </fieldset>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default EditPlaylistDialog;

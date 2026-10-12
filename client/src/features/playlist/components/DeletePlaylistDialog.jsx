import { useEffect, useState } from "react";
import { AlertTriangle, LoaderCircle, Trash2, X } from "lucide-react";

function DeletePlaylistDialog({ playlist, onClose, onDelete }) {
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

  const handleDelete = async () => {
    setError("");
    setLoading(true);

    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Couldn't delete the playlist. Please try again.",
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
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-playlist-title"
        aria-describedby="delete-playlist-description"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#111214] shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2
            id="delete-playlist-title"
            className="text-lg font-semibold text-white"
          >
            Delete playlist
          </h2>

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

        {/* Confirmation content */}
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertTriangle size={24} />
          </div>

          <p
            id="delete-playlist-description"
            className="text-sm leading-6 text-gray-300"
          >
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">
              &ldquo;{playlist?.name || "Untitled playlist"}&rdquo;
            </span>
            ?
          </p>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            This action cannot be undone. The playlist will be removed from your
            library.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {loading ? "Deleting..." : "Delete playlist"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DeletePlaylistDialog;

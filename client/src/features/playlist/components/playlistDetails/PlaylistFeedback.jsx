function PlaylistFeedback({ actionError, notice, error, onRetry }) {
  if (!actionError && !notice && !error) return null;

  return (
    <div className="mt-4 space-y-2">
      {actionError && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
        >
          {actionError}
        </p>
      )}

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-400"
        >
          {notice}
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-400">
          {error}

          <button
            type="button"
            onClick={onRetry}
            className="ml-2 underline underline-offset-2"
          >
            Retry
          </button>
        </p>
      )}
    </div>
  );
}

export default PlaylistFeedback;

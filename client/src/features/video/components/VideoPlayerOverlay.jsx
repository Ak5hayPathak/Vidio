function VideoPlayerOverlay({
  loading,
  isBuffering,
  error,
}) {
  if (!loading && !isBuffering && !error) {
    return null;
  }

  return (
    <div
      className="
        absolute
        inset-0
        z-30
        flex
        items-center
        justify-center
        pointer-events-none
      "
    >
      {(loading || isBuffering) && !error && (
        <div
          className="
            h-10
            w-10
            animate-spin
            rounded-full
            border-4
            border-white/20
            border-t-white
          "
        />
      )}

      {error && (
        <p
          className="
            px-6
            text-center
            text-sm
            text-red-400
          "
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default VideoPlayerOverlay;
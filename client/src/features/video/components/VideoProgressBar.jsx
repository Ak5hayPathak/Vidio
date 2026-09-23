function VideoProgressBar({
  currentTime,
  duration,
  onSeek,
}) {
  const progress =
    duration > 0
      ? (currentTime / duration) * 100
      : 0;

  const handleChange = (event) => {
    onSeek(Number(event.target.value));
  };

  return (
    <div className="group w-full">
      <input
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={Math.min(currentTime, duration || 0)}
        onChange={handleChange}
        disabled={!duration}
        aria-label="Video progress"
        className="
          h-1
          w-full
          cursor-pointer
          appearance-none
          rounded-full
          bg-white/30
          accent-red-600
        "
        style={{
          background: `linear-gradient(
            to right,
            #dc2626 ${progress}%,
            rgba(255,255,255,0.3) ${progress}%
          )`,
        }}
      />
    </div>
  );
}

export default VideoProgressBar;
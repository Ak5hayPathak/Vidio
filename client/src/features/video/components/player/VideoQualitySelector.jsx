function VideoQualitySelector({ levels, currentQuality, onChange }) {
  if (levels.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex justify-end">
      <select
        value={currentQuality}
        onChange={onChange}
        className="
          rounded-lg
          border
          border-white/10
          bg-[#111318]
          px-3
          py-2
          text-sm
          text-white
          outline-none
          transition
          focus:border-red-600
        "
      >
        <option value={-1}>Auto</option>

        {levels.map((level, index) => (
          <option key={`${level.height}-${index}`} value={index}>
            {level.height}p
          </option>
        ))}
      </select>
    </div>
  );
}

export default VideoQualitySelector;

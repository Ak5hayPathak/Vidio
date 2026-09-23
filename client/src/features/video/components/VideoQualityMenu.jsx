import { Check, ChevronLeft } from "lucide-react";

function VideoQualityMenu({
  levels,
  currentQuality,
  onQualityChange,
  onBack,
}) {
  return (
    <div className="w-56">
      <button
        type="button"
        onClick={onBack}
        className="
          flex
          w-full
          items-center
          gap-2
          border-b
          border-white/10
          px-4
          py-3
          text-sm
          font-medium
          text-white
          hover:bg-white/5
        "
      >
        <ChevronLeft size={17} />

        <span>Quality</span>
      </button>

      <div className="max-h-72 overflow-y-auto py-1">
        <button
          type="button"
          onClick={() =>
            onQualityChange(-1)
          }
          className="
            flex
            w-full
            items-center
            justify-between
            px-4
            py-2.5
            text-sm
            text-gray-200
            hover:bg-white/10
          "
        >
          <span>Auto</span>

          {currentQuality === -1 && (
            <Check size={16} />
          )}
        </button>

        {levels.map((level, index) => (
          <button
            key={`${level.height}-${index}`}
            type="button"
            onClick={() =>
              onQualityChange(index)
            }
            className="
              flex
              w-full
              items-center
              justify-between
              px-4
              py-2.5
              text-sm
              text-gray-200
              hover:bg-white/10
            "
          >
            <span>{level.height}p</span>

            {currentQuality === index && (
              <Check size={16} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default VideoQualityMenu;
import { Check, ChevronLeft } from "lucide-react";

const SPEEDS = [
  0.25,
  0.5,
  0.75,
  1,
  1.25,
  1.5,
  1.75,
  2,
];

function VideoSpeedMenu({
  currentSpeed,
  onSpeedChange,
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

        <span>Playback speed</span>
      </button>

      <div className="py-1">
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            onClick={() =>
              onSpeedChange(speed)
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
            <span>
              {speed === 1
                ? "Normal"
                : `${speed}x`}
            </span>

            {currentSpeed === speed && (
              <Check size={16} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default VideoSpeedMenu;
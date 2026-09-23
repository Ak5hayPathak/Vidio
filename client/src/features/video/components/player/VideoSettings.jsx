import {
  ChevronRight,
  Gauge,
  Settings,
} from "lucide-react";

import VideoQualityMenu from "./VideoQualityMenu.jsx";
import VideoSpeedMenu from "./VideoSpeedMenu.jsx";

function VideoSettings({
  open,
  menu,
  levels,
  currentQuality,
  playbackRate,
  onOpen,
  onClose,
  onQualityChange,
  onSpeedChange,
}) {
  if (!open) return null;

  if (menu === "quality") {
    return (
      <div
        className="
          absolute
          bottom-14
          right-2
          z-50
          overflow-hidden
          rounded-xl
          border
          border-white/10
          bg-[#111318]/95
          shadow-2xl
          backdrop-blur-md
        "
      >
        <VideoQualityMenu
          levels={levels}
          currentQuality={currentQuality}
          onQualityChange={(quality) => {
            onQualityChange(quality);
            onClose();
          }}
          onBack={() => onOpen("main")}
        />
      </div>
    );
  }

  if (menu === "speed") {
    return (
      <div
        className="
          absolute
          bottom-14
          right-2
          z-50
          overflow-hidden
          rounded-xl
          border
          border-white/10
          bg-[#111318]/95
          shadow-2xl
          backdrop-blur-md
        "
      >
        <VideoSpeedMenu
          currentSpeed={playbackRate}
          onSpeedChange={(speed) => {
            onSpeedChange(speed);
            onClose();
          }}
          onBack={() => onOpen("main")}
        />
      </div>
    );
  }

  return (
    <div
      className="
        absolute
        bottom-14
        right-2
        z-50
        w-60
        overflow-hidden
        rounded-xl
        border
        border-white/10
        bg-[#111318]/95
        py-1
        shadow-2xl
        backdrop-blur-md
      "
    >
      {levels.length > 0 && (
        <button
          type="button"
          onClick={() => onOpen("quality")}
          className="
            flex
            w-full
            items-center
            justify-between
            px-4
            py-3
            text-sm
            text-gray-200
            hover:bg-white/10
          "
        >
          <span className="flex items-center gap-3">
            <Settings size={17} />

            <span>Quality</span>
          </span>

          <ChevronRight size={16} />
        </button>
      )}

      <button
        type="button"
        onClick={() => onOpen("speed")}
        className="
          flex
          w-full
          items-center
          justify-between
          px-4
          py-3
          text-sm
          text-gray-200
          hover:bg-white/10
        "
      >
        <span className="flex items-center gap-3">
          <Gauge size={17} />

          <span>Playback speed</span>
        </span>

        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default VideoSettings;
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Gauge, Settings } from "lucide-react";

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
  anchorRef,
}) {
  const menuRef = useRef(null);

  const [position, setPosition] = useState({
    bottom: 0,
    right: 0,
  });

  useLayoutEffect(() => {
    if (!open) return;

    function updatePosition() {
      const button = anchorRef?.current;

      if (!button) return;

      const rect = button.getBoundingClientRect();

      setPosition({
        bottom: window.innerHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      });
    }

    function handlePointerDown(event) {
      const target = event.target;

      if (
        menuRef.current?.contains(target) ||
        anchorRef?.current?.contains(target)
      ) {
        return;
      }

      onClose();
    }

    updatePosition();

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, anchorRef, onClose]);

  if (!open) return null;

  let content;

  if (menu === "quality") {
    content = (
      <VideoQualityMenu
        levels={levels}
        currentQuality={currentQuality}
        onQualityChange={(quality) => {
          onQualityChange(quality);
          onClose();
        }}
        onBack={() => onOpen("main")}
      />
    );
  } else if (menu === "speed") {
    content = (
      <VideoSpeedMenu
        currentSpeed={playbackRate}
        onSpeedChange={(speed) => {
          onSpeedChange(speed);
          onClose();
        }}
        onBack={() => onOpen("main")}
      />
    );
  } else {
    content = (
      <>
        {levels.length > 0 && (
          <button
            type="button"
            onClick={() => onOpen("quality")}
            className="
              flex w-full items-center justify-between
              px-4 py-3 text-sm text-gray-200
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
            flex w-full items-center justify-between
            px-4 py-3 text-sm text-gray-200
            hover:bg-white/10
          "
        >
          <span className="flex items-center gap-3">
            <Gauge size={17} />
            <span>Playback speed</span>
          </span>

          <ChevronRight size={16} />
        </button>
      </>
    );
  }

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        bottom: `${position.bottom}px`,
        right: `${position.right}px`,
        zIndex: 9999,
      }}
      className="
        w-60 max-w-[calc(100vw-1rem)]
        overflow-hidden rounded-xl
        border border-white/10
        bg-[#111318]/95
        py-1 shadow-2xl backdrop-blur-md
      "
    >
      {content}
    </div>,
    document.body,
  );
}

export default VideoSettings;

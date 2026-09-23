import { useEffect, useRef, useState } from "react";

import useVideoPlayer from "../hooks/useVideoPlayer.js";
import useVideoControls from "../hooks/useVideoControls.js";

import { recordVideoView } from "../video.service.js";

import VideoPlayerOverlay from "./player/VideoPlayerOverlay.jsx";
import VideoControls from "./player/VideoControls.jsx";

function VideoPlayer({ videoId }) {
  const playerRef = useRef(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMenu, setSettingsMenu] = useState("main");

  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [viewRecorded, setViewRecorded] = useState(false);

  const {
    videoRef,
    levels,
    currentQuality,
    loading,
    error,
    handleQualityChange,
  } = useVideoPlayer(videoId);

  const controls = useVideoControls(videoRef, playerRef);

  /*
   * Create a new viewing session whenever
   * the video changes.
   */
  useEffect(() => {
    setSessionId(crypto.randomUUID());
    setViewRecorded(false);
  }, [videoId]);

  const handleVideoPlay = async () => {
    if (viewRecorded || !videoId) return;

    try {
      await recordVideoView(videoId, sessionId);

      setViewRecorded(true);
    } catch (error) {
      console.error("Failed to record video view:", error);
    }
  };

  const openSettings = (menu = "main") => {
    setSettingsMenu(menu);
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    setSettingsMenu("main");
  };

  return (
    <div
      ref={playerRef}
      className="
        relative
        w-full
        overflow-hidden
        rounded-xl
        bg-black
      "
      onMouseMove={controls.showPlayerControls}
      onTouchStart={controls.showPlayerControls}
    >
      <video
        ref={videoRef}
        data-vidio-player
        playsInline
        preload="metadata"
        className="
          aspect-video
          h-full
          w-full
          object-contain
        "
        onClick={controls.togglePlay}
        onPlay={handleVideoPlay}
      />

      <VideoPlayerOverlay
        loading={loading}
        isBuffering={controls.isBuffering}
        error={error}
      />

      {!error && (
        <VideoControls
          {...controls}
          levels={levels}
          currentQuality={currentQuality}
          handleQualityChange={handleQualityChange}
          settingsOpen={settingsOpen}
          settingsMenu={settingsMenu}
          openSettings={openSettings}
          closeSettings={closeSettings}
        />
      )}
    </div>
  );
}

export default VideoPlayer;

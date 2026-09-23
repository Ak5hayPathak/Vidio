import {
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";

import VideoProgressBar from "./VideoProgressBar.jsx";
import VideoSettings from "./VideoSettings.jsx";

function VideoControls({
  isPlaying,
  currentTime,
  duration,

  volume,
  isMuted,

  playbackRate,

  isFullscreen,
  isPictureInPicture,

  showControls,

  levels,
  currentQuality,

  formatTime,

  togglePlay,
  seek,
  seekTo,

  handleVolumeChange,
  toggleMute,

  handleQualityChange,
  changePlaybackRate,

  toggleFullscreen,
  togglePictureInPicture,

  settingsOpen,
  settingsMenu,
  openSettings,
  closeSettings,
}) {
  if (!showControls) {
    return null;
  }

  return (
    <>
      {/* Bottom gradient */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-32
          bg-gradient-to-t
          from-black/90
          to-transparent
        "
      />

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          z-20
          px-3
          pb-3
          sm:px-4
          sm:pb-4
        "
      >
        {/* Progress */}
        <VideoProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={seekTo}
        />

        {/* Controls */}
        <div
          className="
            mt-2
            flex
            items-center
            justify-between
            gap-2
          "
        >
          {/* Left controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-white
                transition
                hover:bg-white/10
              "
            >
              {isPlaying ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" />
              )}
            </button>

            {/* Rewind */}
            <button
              type="button"
              onClick={() => seek(-10)}
              aria-label="Rewind 10 seconds"
              className="
                hidden
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-white
                transition
                hover:bg-white/10
                sm:flex
              "
            >
              <RotateCcw size={18} />
            </button>

            {/* Forward */}
            <button
              type="button"
              onClick={() => seek(10)}
              aria-label="Forward 10 seconds"
              className="
                hidden
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-white
                transition
                hover:bg-white/10
                sm:flex
              "
            >
              <RotateCw size={18} />
            </button>

            {/* Volume */}
            <div className="group flex items-center">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  text-white
                  transition
                  hover:bg-white/10
                "
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={19} />
                ) : (
                  <Volume2 size={19} />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(event) => handleVolumeChange(event.target.value)}
                aria-label="Volume"
                className="
                  hidden
                  w-20
                  cursor-pointer
                  accent-white
                  md:block
                "
              />
            </div>

            {/* Time */}
            <span
              className="
                ml-1
                whitespace-nowrap
                text-xs
                text-white
                sm:text-sm
              "
            >
              {formatTime(currentTime)}
              {" / "}
              {formatTime(duration)}
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Settings */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (settingsOpen) {
                    closeSettings();
                  } else {
                    openSettings("main");
                  }
                }}
                aria-label="Settings"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  text-white
                  transition
                  hover:bg-white/10
                "
              >
                <Settings size={19} />
              </button>

              <VideoSettings
                open={settingsOpen}
                menu={settingsMenu}
                levels={levels}
                currentQuality={currentQuality}
                playbackRate={playbackRate}
                onOpen={openSettings}
                onClose={closeSettings}
                onQualityChange={handleQualityChange}
                onSpeedChange={changePlaybackRate}
              />
            </div>

            {/* Picture in Picture */}
            <button
              type="button"
              onClick={togglePictureInPicture}
              aria-label="Picture in picture"
              className="
                hidden
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-white
                transition
                hover:bg-white/10
                sm:flex
              "
            >
              <PictureInPicture2
                size={19}
                className={isPictureInPicture ? "text-red-500" : ""}
              />
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-white
                transition
                hover:bg-white/10
              "
            >
              {isFullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default VideoControls;

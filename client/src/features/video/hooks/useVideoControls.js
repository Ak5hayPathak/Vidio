import { useCallback, useEffect, useRef, useState } from "react";

function useVideoControls(videoRef, playerRef) {
  const hideControlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const [playbackRate, setPlaybackRate] = useState(1);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] =
    useState(false);

  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  /*
   * Format seconds into:
   *
   * 00:00
   * 01:24
   * 1:02:35
   */
  const formatTime = useCallback((seconds) => {
    if (!Number.isFinite(seconds)) {
      return "00:00";
    }

    const totalSeconds = Math.floor(seconds);

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60,
    );

    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(
        2,
        "0",
      )}:${String(remainingSeconds).padStart(
        2,
        "0",
      )}`;
    }

    return `${String(minutes).padStart(
      2,
      "0",
    )}:${String(remainingSeconds).padStart(
      2,
      "0",
    )}`;
  }, []);

  /*
   * Play / pause
   */
  const togglePlay = useCallback(async () => {
    const video = videoRef.current;

    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (error) {
      console.error("Playback failed:", error);
    }
  }, [videoRef]);

  /*
   * Seek relative to the current position.
   *
   * Example:
   * -10 = rewind 10 seconds
   * +10 = forward 10 seconds
   */
  const seek = useCallback(
    (amount) => {
      const video = videoRef.current;

      if (!video) return;

      video.currentTime = Math.max(
        0,
        Math.min(
          video.duration || Infinity,
          video.currentTime + amount,
        ),
      );
    },
    [videoRef],
  );

  /*
   * Seek to an exact position.
   *
   * Used by the progress bar.
   */
  const seekTo = useCallback(
    (time) => {
      const video = videoRef.current;

      if (!video) return;

      const targetTime = Number(time);

      if (!Number.isFinite(targetTime)) return;

      video.currentTime = Math.max(
        0,
        Math.min(
          video.duration || 0,
          targetTime,
        ),
      );

      setCurrentTime(video.currentTime);
    },
    [videoRef],
  );

  /*
   * Change volume
   */
  const handleVolumeChange = useCallback(
    (value) => {
      const video = videoRef.current;

      if (!video) return;

      const newVolume = Number(value);

      video.volume = newVolume;

      if (newVolume > 0) {
        video.muted = false;
        setIsMuted(false);
      }

      setVolume(newVolume);
    },
    [videoRef],
  );

  /*
   * Mute / unmute
   */
  const toggleMute = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;

    setIsMuted(video.muted);
  }, [videoRef]);

  /*
   * Playback speed
   */
  const changePlaybackRate = useCallback(
    (rate) => {
      const video = videoRef.current;

      if (!video) return;

      video.playbackRate = rate;

      setPlaybackRate(rate);
    },
    [videoRef],
  );

  /*
   * Fullscreen
   */
  const toggleFullscreen = useCallback(async () => {
    const player = playerRef.current;

    if (!player) return;

    try {
      if (!document.fullscreenElement) {
        await player.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error(
        "Fullscreen request failed:",
        error,
      );
    }
  }, [playerRef]);

  /*
   * Picture-in-picture
   */
  const togglePictureInPicture = useCallback(
    async () => {
      const video = videoRef.current;

      if (!video) return;

      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          return;
        }

        if (document.pictureInPictureEnabled) {
          await video.requestPictureInPicture();
        }
      } catch (error) {
        console.error(
          "Picture-in-picture failed:",
          error,
        );
      }
    },
    [videoRef],
  );

  /*
   * Show controls and automatically hide
   * them while the video is playing.
   */
  const showPlayerControls = useCallback(() => {
    setShowControls(true);

    if (hideControlsTimeoutRef.current) {
      clearTimeout(
        hideControlsTimeoutRef.current,
      );
    }

    if (!isPlaying) return;

    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  /*
   * Video events
   */
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      setShowControls(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleVolume = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(
        Boolean(document.fullscreenElement),
      );
    };

    /*
     * Video started waiting for more data.
     */
    const handleWaiting = () => {
      setIsBuffering(true);
    };

    /*
     * Video has enough data and resumed playback.
     */
    const handlePlaying = () => {
      setIsBuffering(false);
    };

    const handleEnterPiP = () => {
      setIsPictureInPicture(true);
    };

    const handleLeavePiP = () => {
      setIsPictureInPicture(false);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    video.addEventListener(
      "timeupdate",
      handleTimeUpdate,
    );

    video.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata,
    );

    video.addEventListener(
      "durationchange",
      handleDurationChange,
    );

    video.addEventListener(
      "volumechange",
      handleVolume,
    );

    video.addEventListener(
      "waiting",
      handleWaiting,
    );

    video.addEventListener(
      "playing",
      handlePlaying,
    );

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange,
    );

    video.addEventListener(
      "enterpictureinpicture",
      handleEnterPiP,
    );

    video.addEventListener(
      "leavepictureinpicture",
      handleLeavePiP,
    );

    return () => {
      video.removeEventListener(
        "play",
        handlePlay,
      );

      video.removeEventListener(
        "pause",
        handlePause,
      );

      video.removeEventListener(
        "timeupdate",
        handleTimeUpdate,
      );

      video.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata,
      );

      video.removeEventListener(
        "durationchange",
        handleDurationChange,
      );

      video.removeEventListener(
        "volumechange",
        handleVolume,
      );

      video.removeEventListener(
        "waiting",
        handleWaiting,
      );

      video.removeEventListener(
        "playing",
        handlePlaying,
      );

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
      );

      video.removeEventListener(
        "enterpictureinpicture",
        handleEnterPiP,
      );

      video.removeEventListener(
        "leavepictureinpicture",
        handleLeavePiP,
      );
    };
  }, [videoRef]);

  /*
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case " ":
        case "k":
          event.preventDefault();
          togglePlay();
          break;

        case "arrowleft":
          event.preventDefault();
          seek(-10);
          break;

        case "arrowright":
          event.preventDefault();
          seek(10);
          break;

        case "m":
          event.preventDefault();
          toggleMute();
          break;

        case "f":
          event.preventDefault();
          toggleFullscreen();
          break;

        default:
          break;
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    togglePlay,
    seek,
    toggleMute,
    toggleFullscreen,
  ]);

  /*
   * Cleanup control timeout.
   */
  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(
          hideControlsTimeoutRef.current,
        );
      }
    };
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,

    volume,
    isMuted,

    playbackRate,

    isFullscreen,
    isPictureInPicture,

    showControls,
    isBuffering,

    formatTime,

    togglePlay,
    seek,
    seekTo,

    handleVolumeChange,
    toggleMute,

    changePlaybackRate,

    toggleFullscreen,
    togglePictureInPicture,

    showPlayerControls,
  };
}

export default useVideoControls;
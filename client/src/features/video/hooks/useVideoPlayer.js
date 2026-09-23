import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

import {
  getStreamToken,
  getStreamUrl,
} from "../video.service.js";

import { rewriteHlsUrl } from "../video.utils.js";

const TOKEN_REFRESH_INTERVAL = 8 * 60 * 1000;

function useVideoPlayer(videoId) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const streamTokenRef = useRef(null);

  const [levels, setLevels] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !videoId) return;

    let cancelled = false;
    let tokenRefreshInterval = null;

    const initializePlayer = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Get initial stream token.
         */
        const streamToken = await getStreamToken(videoId);

        if (cancelled) return;

        streamTokenRef.current = streamToken;

        const videoUrl = getStreamUrl(videoId);

        /*
         * HLS.js
         */
        if (Hls.isSupported()) {
          class CustomPlaylistLoader extends Hls.DefaultConfig.loader {
            load(context, config, callbacks) {
              context.url = rewriteHlsUrl(context.url);

              return super.load(
                context,
                config,
                callbacks,
              );
            }
          }

          const hls = new Hls({
            pLoader: CustomPlaylistLoader,

            xhrSetup: (xhr) => {
              xhr.withCredentials = true;

              if (streamTokenRef.current) {
                xhr.setRequestHeader(
                  "Authorization",
                  `Bearer ${streamTokenRef.current}`,
                );
              }
            },
          });

          hlsRef.current = hls;

          /*
           * Master playlist loaded.
           */
          hls.on(
            Hls.Events.MANIFEST_PARSED,
            () => {
              if (cancelled) return;

              setLevels(hls.levels);
              setLoading(false);
            },
          );

          /*
           * Quality changed.
           */
          hls.on(
            Hls.Events.LEVEL_SWITCHED,
            (_, data) => {
              if (cancelled) return;

              setCurrentQuality(data.level);
            },
          );

          /*
           * HLS errors.
           */
          hls.on(
            Hls.Events.ERROR,
            (_, data) => {
              console.error(
                "HLS error:",
                data,
              );

              if (
                !data.fatal ||
                cancelled
              ) {
                return;
              }

              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error(
                    "HLS network error. Retrying...",
                  );

                  hls.startLoad();
                  break;

                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error(
                    "HLS media error. Recovering...",
                  );

                  hls.recoverMediaError();
                  break;

                default:
                  console.error(
                    "Fatal HLS error:",
                    data,
                  );

                  setError(
                    "Unable to play this video.",
                  );

                  setLoading(false);

                  hls.destroy();
                  hlsRef.current = null;
              }
            },
          );

          /*
           * Load HLS master playlist.
           */
          hls.loadSource(videoUrl);

          /*
           * Attach HLS to video.
           */
          hls.attachMedia(video);

          /*
           * Refresh stream token.
           */
          tokenRefreshInterval = setInterval(
            async () => {
              try {
                const newToken =
                  await getStreamToken(
                    videoId,
                  );

                if (cancelled) return;

                streamTokenRef.current =
                  newToken;

                console.log(
                  "Stream token refreshed",
                );
              } catch (error) {
                console.error(
                  "Failed to refresh stream token:",
                  error,
                );
              }
            },
            TOKEN_REFRESH_INTERVAL,
          );

          return;
        }

        /*
         * Native HLS support.
         */
        if (
          video.canPlayType(
            "application/vnd.apple.mpegurl",
          )
        ) {
          video.src = videoUrl;

          video.addEventListener(
            "loadedmetadata",
            () => {
              if (cancelled) return;

              setLoading(false);
            },
            { once: true },
          );

          return;
        }

        /*
         * HLS unsupported.
         */
        setError(
          "HLS playback is not supported in this browser.",
        );

        setLoading(false);
      } catch (error) {
        console.error(
          "Failed to initialize video player:",
          error,
        );

        if (cancelled) return;

        setError(
          error.message ||
            "Failed to load video.",
        );

        setLoading(false);
      }
    };

    initializePlayer();

    /*
     * Cleanup.
     */
    return () => {
      cancelled = true;

      if (tokenRefreshInterval) {
        clearInterval(
          tokenRefreshInterval,
        );
      }

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      video.pause();
      video.removeAttribute("src");
      video.load();

      streamTokenRef.current = null;

      setLevels([]);
      setCurrentQuality(-1);
      setLoading(true);
      setError("");
    };
  }, [videoId]);

  /*
   * Change video quality.
   *
   * -1 = automatic quality selection.
   * Other values represent the HLS level index.
   */
  const handleQualityChange = (level) => {
    if (!hlsRef.current) return;

    hlsRef.current.currentLevel = level;

    setCurrentQuality(level);
  };

  return {
    videoRef,
    levels,
    currentQuality,
    loading,
    error,
    handleQualityChange,
  };
}

export default useVideoPlayer;
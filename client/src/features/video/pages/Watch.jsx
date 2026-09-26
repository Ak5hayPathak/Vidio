import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getVideo } from "../video.service.js";

import VideoPlayer from "../components/VideoPlayer.jsx";
import VideoChannel from "../components/VideoChannel.jsx";
import VideoActions from "../components/VideoActions.jsx";
import VideoDescription from "../components/VideoDescription.jsx";
import RecommendedVideos from "../components/RecommendedVideos.jsx";
import Comments from "../components/Comments.jsx";

function Watch() {
  const { videoId } = useParams();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getVideo(videoId);

        setVideo(data);
      } catch (error) {
        console.error("Failed to fetch video:", error);

        setError(error.response?.data?.message || "Unable to load this video.");
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090b] text-white">
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <div
            className="
              aspect-video
              w-full
              animate-pulse
              rounded-xl
              bg-[#111318]
            "
          />

          <div
            className="
              mt-5
              h-7
              w-3/4
              animate-pulse
              rounded
              bg-[#111318]
            "
          />

          <div
            className="
              mt-3
              h-4
              w-1/4
              animate-pulse
              rounded
              bg-[#111318]
            "
          />
        </main>
      </div>
    );
  }

  /*
   * Error state
   */
  if (error || !video) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#08090b]
          px-4
          text-white
        "
      >
        <div className="text-center">
          <h1 className="text-xl font-semibold">Unable to load video</h1>

          <p className="mt-2 text-sm text-gray-500">
            {error || "Video not found."}
          </p>

          <Link
            to="/"
            className="
              mt-5
              inline-block
              rounded-full
              bg-red-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-red-700
            "
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div
          className="
            grid
            gap-8
            xl:grid-cols-[minmax(0,1fr)_360px]
          "
        >
          {/* Main content */}
          <section className="min-w-0">
            {/* Video player */}
            <VideoPlayer videoId={videoId} />

            {/* Video information */}
            <div className="mt-5">
              {/* Title */}
              <h1
                className="
                  text-xl
                  font-semibold
                  leading-7
                  sm:text-2xl
                "
              >
                {video.title}
              </h1>

              {/* Views + date */}
              <div
                className="
                  mt-3
                  flex
                  flex-wrap
                  items-center
                  gap-x-3
                  gap-y-1
                  text-sm
                  text-gray-500
                "
              >
                <span>{video.views?.toLocaleString() || 0} views</span>

                <span>·</span>

                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Channel + actions */}
              <div
                className="
                  mt-5
                  flex
                  flex-col
                  gap-5
                  border-b
                  border-white/10
                  pb-5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <VideoChannel video={video} />

                <VideoActions video={video} />
              </div>

              {/* Description */}
              <VideoDescription description={video.description} />

              {/* Comments */}
              <Comments />
            </div>
          </section>

          {/* Recommended videos */}
          {/* <RecommendedVideos /> */}
        </div>
      </main>
    </div>
  );
}

export default Watch;

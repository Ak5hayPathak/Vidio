import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";

import EditVideoForm from "../components/edit/EditVideoForm.jsx";

import {
  getVideo,
  updateVideo,
  togglePublishStatus,
  deleteVideo,
} from "../video.service.js";

const EditVideo = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError("");

        const videoData = await getVideo(videoId);

        setVideo(videoData);

        setTitle(videoData.title || "");
        setDescription(videoData.description || "");
        setTags(videoData.tags?.join(", ") || "");
        setIsPublished(videoData.isPublished ?? false);
      } catch (error) {
        console.error("Failed to fetch video:", error);

        setError(
          error.response?.data?.message || "Failed to load video."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Update video details
      const response = await updateVideo({
        videoId,
        title: title.trim(),
        description: description.trim(),
        tags,
        thumbnail,
      });

      // Check whether visibility actually changed
      const currentPublishedStatus = video.isPublished ?? false;

      if (isPublished !== currentPublishedStatus) {
        await togglePublishStatus(videoId);
      }

      setMessage(response.message || "Video updated successfully.");

      setThumbnail(null);

      // Keep local video state in sync
      setVideo((previous) => ({
        ...previous,
        title: title.trim(),
        description: description.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isPublished,
        ...(thumbnail ? {} : { thumbnail: previous.thumbnail }),
      }));
    } catch (error) {
      console.error("Failed to update video:", error);

      setError(
        error.response?.data?.message || "Unable to update video."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting || isSubmitting) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${video.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setMessage("");
      setError("");

      const response = await deleteVideo(videoId);

      setMessage(response?.message || "Video deleted successfully.");

      // Give the success message a moment before navigating.
      setTimeout(() => {
        navigate("/your-videos");
      }, 500);
    } catch (error) {
      console.error("Failed to delete video:", error);

      setError(
        error.response?.data?.message || "Unable to delete video."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090b] px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-[#08090b] px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/your-videos"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              text-gray-400
              transition
              hover:text-white
            "
          >
            <ArrowLeft size={18} />
            Back to Your Videos
          </Link>

          <p className="mt-6 text-sm text-red-400">
            {error || "Video not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/channel"
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                text-sm
                text-gray-400
                transition
                hover:text-white
              "
            >
              <ArrowLeft size={18} />
              Back to Your Videos
            </Link>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Edit Video
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update your video's information and visibility.
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div
              className="
                mb-6
                rounded-xl
                border
                border-green-600/20
                bg-green-600/10
                px-4
                py-3
                text-sm
                text-green-400
              "
            >
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className="
                mb-6
                rounded-xl
                border
                border-red-600/20
                bg-red-600/10
                px-4
                py-3
                text-sm
                text-red-400
              "
            >
              {error}
            </div>
          )}

          {/* Edit Form */}
          <EditVideoForm
            existingVideo={video}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            tags={tags}
            setTags={setTags}
            isPublished={isPublished}
            setIsPublished={setIsPublished}
            thumbnail={thumbnail}
            setThumbnail={setThumbnail}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting || isDeleting}
          />

          {/* Delete Section */}
          <div
            className="
              mt-8
              rounded-2xl
              border
              border-red-600/20
              bg-red-600/5
              p-5
              sm:p-6
            "
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Delete Video
                </h2>

                <p className="mt-1 max-w-xl text-sm text-gray-500">
                  Permanently delete this video and its associated data.
                  This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="
                  inline-flex
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-red-600/30
                  bg-red-600/10
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-red-400
                  transition
                  hover:bg-red-600
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Trash2 size={17} />

                {isDeleting ? "Deleting..." : "Delete Video"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditVideo;

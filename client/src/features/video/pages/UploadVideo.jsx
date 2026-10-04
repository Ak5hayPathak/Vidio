
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useSocket } from "../../../context/SocketContext.jsx";
import { uploadVideo } from "../video.service.js";

import VideoUploadForm from "../components/upload/VideoUploadForm.jsx";
import VideoUploadProgress from "../components/upload/VideoUploadProgress.jsx";
import VideoUploadActions from "../components/upload/VideoUploadActions.jsx";

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  tags: "",
  videoFile: null,
  thumbnail: null,
};

const INITIAL_PROGRESS_STATE = {
  uploadProgress: 0,
  processingProgress: 0,
  processingStage: "",
};

const UploadVideo = () => {
  const { socket } = useSocket();

  // Form state
  const [title, setTitle] = useState(INITIAL_FORM_STATE.title);
  const [description, setDescription] = useState(
    INITIAL_FORM_STATE.description,
  );
  const [tags, setTags] = useState(INITIAL_FORM_STATE.tags);
  const [videoFile, setVideoFile] = useState(
    INITIAL_FORM_STATE.videoFile,
  );
  const [thumbnail, setThumbnail] = useState(
    INITIAL_FORM_STATE.thumbnail,
  );

  // Upload and processing state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [videoId, setVideoId] = useState(null);

  // Error state
  const [error, setError] = useState("");

  const isBusy =
    uploadStatus === "uploading" ||
    uploadStatus === "processing";

  const canSubmit =
    Boolean(title.trim()) &&
    Boolean(videoFile) &&
    !isBusy;

  // Reset progress values
  const resetProgress = useCallback(() => {
    setUploadProgress(INITIAL_PROGRESS_STATE.uploadProgress);
    setProcessingProgress(
      INITIAL_PROGRESS_STATE.processingProgress,
    );
    setProcessingStage(INITIAL_PROGRESS_STATE.processingStage);
  }, []);

  // Reset form and upload state
  const resetForm = useCallback(() => {
    setTitle(INITIAL_FORM_STATE.title);
    setDescription(INITIAL_FORM_STATE.description);
    setTags(INITIAL_FORM_STATE.tags);
    setVideoFile(INITIAL_FORM_STATE.videoFile);
    setThumbnail(INITIAL_FORM_STATE.thumbnail);

    resetProgress();

    setVideoId(null);
    setError("");
    setUploadStatus("idle");
  }, [resetProgress]);

  // Listen for video processing progress
  useEffect(() => {
    if (!socket || !videoId) return;

    const handleProcessingProgress = (data) => {
      // Ignore invalid events and events for other videos.
      if (
        !data ||
        String(data.videoId) !== String(videoId)
      ) {
        return;
      }

      // Handle processing failure.
      if (
        data.status === "failed" ||
        data.stage === "failed"
      ) {
        setUploadStatus("failed");
        setError(
          data.message ||
            "Video processing failed. Please try again.",
        );

        return;
      }

      // Handle successful completion.
      if (
        data.status === "ready" ||
        data.status === "completed" ||
        data.stage === "completed"
      ) {
        setProcessingProgress(100);
        setProcessingStage("completed");
        setUploadStatus("completed");
        setError("");

        return;
      }

      // Normalize progress to a percentage between 0 and 100.
      const rawProgress = Number(data.progress);

      const normalizedProgress = Number.isFinite(rawProgress)
        ? Math.min(100, Math.max(0, Math.round(rawProgress)))
        : 0;

      setProcessingProgress(normalizedProgress);
      setProcessingStage(
        data.stage || "Processing video",
      );
      setUploadStatus("processing");
    };

    socket.on(
      "video-processing-progress",
      handleProcessingProgress,
    );

    return () => {
      socket.off(
        "video-processing-progress",
        handleProcessingProgress,
      );
    };
  }, [socket, videoId]);

  // Handle video upload
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions.
    if (isBusy) return;

    // Validate required fields.
    if (!title.trim() || !videoFile) {
      setError("Please provide a title and video.");
      return;
    }

    // Initialize a new upload.
    setError("");
    setVideoId(null);
    resetProgress();
    setUploadStatus("uploading");

    try {
      const uploadedVideo = await uploadVideo(
        {
          title: title.trim(),
          description: description.trim(),
          tags,
          videoFile,
          thumbnail,
        },
        (progressEvent) => {
          if (!progressEvent.total) return;

          const percent = Math.round(
            (progressEvent.loaded * 100) /
              progressEvent.total,
          );

          setUploadProgress(
            Math.min(100, Math.max(0, percent)),
          );
        },
      );

      // Validate the upload response.
      if (!uploadedVideo?._id) {
        throw new Error(
          "The server did not return a valid video ID.",
        );
      }

      // Transition from upload to processing.
      setVideoId(uploadedVideo._id);
      setUploadProgress(100);
      setProcessingProgress(0);
      setProcessingStage("Processing video");
      setUploadStatus("processing");
    } catch (err) {
      setUploadStatus("error");

      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while uploading the video.",
      );
    }
  };

  // Cancel/reset the form when no operation is active.
  const handleCancel = () => {
    if (isBusy) return;

    resetForm();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Upload Video
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Share your video with the Vidio community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload form */}
        <VideoUploadForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          tags={tags}
          setTags={setTags}
          videoFile={videoFile}
          setVideoFile={setVideoFile}
          thumbnail={thumbnail}
          setThumbnail={setThumbnail}
          disabled={isBusy}
        />

        {/* Upload and processing progress */}
        <VideoUploadProgress
          uploadProgress={uploadProgress}
          processingProgress={processingProgress}
          processingStage={processingStage}
          uploadStatus={uploadStatus}
        />

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {/* Successful completion */}
        {uploadStatus === "completed" && videoId && (
          <div
            role="status"
            className="rounded-lg border border-green-900 bg-green-950/20 px-4 py-3 text-sm text-green-400"
          >
            Your video has been processed successfully.{" "}

            <Link
              to={`/video/watch/${videoId}`}
              className="font-medium underline"
            >
              Watch video
            </Link>
          </div>
        )}

        {/* Form actions */}
        <VideoUploadActions
          uploadStatus={uploadStatus}
          disabled={!canSubmit}
          onCancel={handleCancel}
        />
      </form>
    </div>
  );
};

export default UploadVideo;
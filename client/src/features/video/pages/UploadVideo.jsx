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

  // -----------------------------
  // Form state
  // -----------------------------

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  // -----------------------------
  // Upload / processing state
  // -----------------------------

  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("");

  const [uploadStatus, setUploadStatus] = useState("idle");
  const [videoId, setVideoId] = useState(null);

  // -----------------------------
  // Error state
  // -----------------------------

  const [error, setError] = useState("");

  // -----------------------------
  // Derived state
  // -----------------------------

  const isBusy =
    uploadStatus === "uploading" ||
    uploadStatus === "processing";

  const canSubmit =
    Boolean(title.trim()) &&
    Boolean(videoFile) &&
    !isBusy;

  // -----------------------------
  // Reset progress
  // -----------------------------

  const resetProgress = useCallback(() => {
    setUploadProgress(INITIAL_PROGRESS_STATE.uploadProgress);
    setProcessingProgress(
      INITIAL_PROGRESS_STATE.processingProgress,
    );
    setProcessingStage(
      INITIAL_PROGRESS_STATE.processingStage,
    );
  }, []);

  // -----------------------------
  // Reset entire form
  // -----------------------------

  const resetForm = useCallback(() => {
    setTitle(INITIAL_FORM_STATE.title);
    setDescription(INITIAL_FORM_STATE.description);
    setTags(INITIAL_FORM_STATE.tags);
    setVideoFile(INITIAL_FORM_STATE.videoFile);
    setThumbnail(INITIAL_FORM_STATE.thumbnail);

    resetProgress();

    setVideoId(null);
    setUploadStatus("idle");
    setError("");
  }, [resetProgress]);

  // -----------------------------
  // Listen for processing events
  // -----------------------------

  useEffect(() => {
    if (!socket) return;

    const handleProcessingProgress = (data) => {
      if (!data) return;

      /*
       * Ignore events that don't belong to the
       * currently uploaded video.
       *
       * Before videoId exists, there is nothing
       * to process, so ignore the event.
       */
      if (
        !videoId ||
        String(data.videoId) !== String(videoId)
      ) {
        return;
      }

      console.log(
        "Video processing progress:",
        data,
      );

      // -----------------------------
      // Processing failed
      // -----------------------------

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

      // -----------------------------
      // Processing completed
      // -----------------------------

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

      // -----------------------------
      // Normal progress
      // -----------------------------

      const rawProgress = Number(data.progress);

      const progress = Number.isFinite(rawProgress)
        ? Math.min(
            100,
            Math.max(0, Math.round(rawProgress)),
          )
        : 0;

      setProcessingProgress(progress);

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

  // -----------------------------
  // Handle video upload
  // -----------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBusy) return;

    // -----------------------------
    // Validate form
    // -----------------------------

    if (!title.trim() || !videoFile) {
      setError("Please provide a title and video.");
      return;
    }

    // -----------------------------
    // Initialize upload
    // -----------------------------

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

          const progress = Math.round(
            (progressEvent.loaded * 100) /
              progressEvent.total,
          );

          setUploadProgress(
            Math.min(100, Math.max(0, progress)),
          );
        },
      );

      // -----------------------------
      // Validate server response
      // -----------------------------

      if (!uploadedVideo?._id) {
        throw new Error(
          "The server did not return a valid video ID.",
        );
      }

      // -----------------------------
      // Start processing state
      // -----------------------------

      setVideoId(uploadedVideo._id);

      setUploadProgress(100);
      setProcessingProgress(0);
      setProcessingStage("Processing thumbnail");
      setUploadStatus("processing");

      console.log(
        "Video uploaded successfully:",
        uploadedVideo._id,
      );
    } catch (err) {
      console.error("Video upload failed:", err);

      setUploadStatus("error");

      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while uploading the video.",
      );
    }
  };

  // -----------------------------
  // Cancel / reset
  // -----------------------------

  const handleCancel = () => {
    if (isBusy) return;

    resetForm();
  };

  // -----------------------------
  // Render
  // -----------------------------

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

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
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

        {/* Upload / processing progress */}

        <VideoUploadProgress
          uploadProgress={uploadProgress}
          processingProgress={processingProgress}
          processingStage={processingStage}
          uploadStatus={uploadStatus}
        />

        {/* Error */}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {/* Completed */}

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

        {/* Actions */}

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

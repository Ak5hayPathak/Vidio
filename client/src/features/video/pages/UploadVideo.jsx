import { useCallback, useEffect, useRef, useState } from "react";
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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [videoId, setVideoId] = useState(null);

  const [error, setError] = useState("");

  /*
   * Refs are used here because socket events can arrive before
   * React finishes updating state with setVideoId().
   */
  const videoIdRef = useRef(null);
  const pendingProcessingEventsRef = useRef(new Map());

  const isBusy =
    uploadStatus === "uploading" ||
    uploadStatus === "processing";

  const canSubmit =
    Boolean(title.trim()) &&
    Boolean(videoFile) &&
    !isBusy;

  const resetProgress = useCallback(() => {
    setUploadProgress(INITIAL_PROGRESS_STATE.uploadProgress);
    setProcessingProgress(INITIAL_PROGRESS_STATE.processingProgress);
    setProcessingStage(INITIAL_PROGRESS_STATE.processingStage);
  }, []);

  const resetForm = useCallback(() => {
    setTitle(INITIAL_FORM_STATE.title);
    setDescription(INITIAL_FORM_STATE.description);
    setTags(INITIAL_FORM_STATE.tags);
    setVideoFile(INITIAL_FORM_STATE.videoFile);
    setThumbnail(INITIAL_FORM_STATE.thumbnail);

    resetProgress();

    videoIdRef.current = null;
    pendingProcessingEventsRef.current.clear();

    setVideoId(null);
    setUploadStatus("idle");
    setError("");
  }, [resetProgress]);

  /*
   * Applies a processing event to the UI.
   *
   * Kept separate from the socket listener so we can also apply
   * an event that arrived before the upload request finished.
   */
  const applyProcessingProgress = useCallback((data) => {
    if (!data) return;

    //console.log("Video processing progress:", data);

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

    const rawProgress = Number(data.progress);

    const progress = Number.isFinite(rawProgress)
      ? Math.min(100, Math.max(0, Math.round(rawProgress)))
      : 0;

    setProcessingProgress(progress);
    setProcessingStage(
      data.stage || "Processing video",
    );
    setUploadStatus("processing");
  }, []);

  /*
   * IMPORTANT:
   * This listener is attached whenever the socket exists,
   * NOT whenever videoId exists.
   *
   * That prevents the race condition where the worker emits
   * an event before React has received/set the video ID.
   */
  useEffect(() => {
    if (!socket) return;

    const handleProcessingProgress = (data) => {
      if (!data?.videoId) return;

      const incomingVideoId = String(data.videoId);

      /*
       * Always remember the latest event for this video.
       * If the upload request hasn't returned yet, we'll apply
       * this event once we receive the video ID.
       */
      pendingProcessingEventsRef.current.set(
        incomingVideoId,
        data,
      );

      const currentVideoId = videoIdRef.current;

      /*
       * This event belongs to another upload, or our current
       * upload hasn't received its ID yet.
       */
      if (
        !currentVideoId ||
        incomingVideoId !== String(currentVideoId)
      ) {
        return;
      }

      applyProcessingProgress(data);
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
  }, [socket, applyProcessingProgress]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBusy) return;

    if (!title.trim() || !videoFile) {
      setError("Please provide a title and video.");
      return;
    }

    setError("");

    videoIdRef.current = null;
    pendingProcessingEventsRef.current.clear();

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

      if (!uploadedVideo?._id) {
        throw new Error(
          "The server did not return a valid video ID.",
        );
      }

      const uploadedVideoId = String(uploadedVideo._id);

      /*
       * Update the ref FIRST.
       *
       * Socket events now know which video belongs to the
       * current upload even before React state updates.
       */
      videoIdRef.current = uploadedVideoId;

      setVideoId(uploadedVideoId);

      setUploadProgress(100);
      setProcessingProgress(0);
      setProcessingStage("Processing thumbnail");
      setUploadStatus("processing");

      /*
       * The worker may have already emitted one or more
       * processing events before the upload request returned.
       *
       * Apply the latest cached event immediately.
       */
      const pendingEvent =
        pendingProcessingEventsRef.current.get(
          uploadedVideoId,
        );

      if (pendingEvent) {
        pendingProcessingEventsRef.current.delete(
          uploadedVideoId,
        );

        applyProcessingProgress(pendingEvent);
      }

      console.log(
        "Video uploaded successfully:",
        uploadedVideoId,
      );
    } catch (err) {
      console.error("Video upload failed:", err);

      videoIdRef.current = null;

      setUploadStatus("error");

      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while uploading the video.",
      );
    }
  };

  const handleCancel = () => {
    if (isBusy) return;
    resetForm();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Upload Video
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Share your video with the Vidio community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <VideoUploadProgress
          uploadProgress={uploadProgress}
          processingProgress={processingProgress}
          processingStage={processingStage}
          uploadStatus={uploadStatus}
        />

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

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

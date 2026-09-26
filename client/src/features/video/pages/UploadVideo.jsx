import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useSocket } from "../../../context/SocketContext.jsx";
import { uploadVideo } from "../video.service.js";

import VideoUploadForm from "../components/upload/VideoUploadForm.jsx";
import VideoUploadProgress from "../components/upload/VideoUploadProgress.jsx";
import VideoUploadActions from "../components/upload/VideoUploadActions.jsx";

const UploadVideo = () => {
  const { socket } = useSocket();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("idle");

  // Processing state
  const [videoId, setVideoId] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("");

  // Error state
  const [error, setError] = useState("");

  const isBusy =
    uploadStatus === "uploading" ||
    uploadStatus === "processing";

  // Listen for video processing progress
  useEffect(() => {
    if (!socket || !videoId) return;

    const handleProcessingProgress = (data) => {
      if (data.videoId !== videoId) return;

      //console.log("Video processing progress:", data);

      setProcessingProgress(data.progress ?? 0);
      setProcessingStage(data.stage ?? "");

      if (
        data.status === "ready" ||
        data.stage === "completed"
      ) {
        setProcessingProgress(100);
        setProcessingStage("completed");
        setUploadStatus("completed");
      }

      if (
        data.status === "failed" ||
        data.stage === "failed"
      ) {
        setUploadStatus("error");
        setError(
          "Video processing failed. Please try again."
        );
      }
    };

    socket.on(
      "video-processing-progress",
      handleProcessingProgress
    );

    return () => {
      socket.off(
        "video-processing-progress",
        handleProcessingProgress
      );
    };
  }, [socket, videoId]);

  // Upload video
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !videoFile) {
      setError("Please provide a title and video.");
      return;
    }

    setError("");
    setVideoId(null);

    setUploadProgress(0);
    setProcessingProgress(0);
    setProcessingStage("");

    setUploadStatus("uploading");

    try {
      const uploadedVideo = await uploadVideo(
        {
          title,
          description,
          tags,
          videoFile,
          thumbnail,
        },
        (progressEvent) => {
          if (!progressEvent.total) return;

          const percent = Math.round(
            (progressEvent.loaded * 100) /
              progressEvent.total
          );

          setUploadProgress(percent);
        }
      );

      // //console.log(
      //   "Video upload response:",
      //   uploadedVideo
      // );

      setVideoId(uploadedVideo._id);

      setUploadProgress(100);
      setProcessingProgress(0);
      setProcessingStage("Processing thumbnail");
      setUploadStatus("processing");
    } catch (err) {
      // console.error("Video upload failed:", err);

      setUploadStatus("error");

      setError(
        err.response?.data?.message ||
          "Something went wrong while uploading the video."
      );
    }
  };

  const handleCancel = () => {
    if (isBusy) return;

    setTitle("");
    setDescription("");
    setTags("");
    setVideoFile(null);
    setThumbnail(null);

    setUploadProgress(0);
    setProcessingProgress(0);
    setProcessingStage("");
    setVideoId(null);
    setError("");
    setUploadStatus("idle");
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

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
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
          <div className="rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {uploadStatus === "completed" && videoId && (
          <div className="rounded-lg border border-green-900 bg-green-950/20 px-4 py-3 text-sm text-green-400">
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
          disabled={!title.trim() || !videoFile}
          onCancel={handleCancel}
        />
      </form>
    </div>
  );
};

export default UploadVideo;
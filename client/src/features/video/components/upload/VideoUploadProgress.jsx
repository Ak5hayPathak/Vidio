const VideoUploadProgress = ({
  uploadProgress = 0,
  processingProgress = 0,
  processingStage,
  uploadStatus,
}) => {
  if (uploadStatus === "idle") {
    return null;
  }

  const isUploading = uploadStatus === "uploading";
  const isProcessing = uploadStatus === "processing";
  const isCompleted = uploadStatus === "completed";
  const isFailed = uploadStatus === "failed";

  // Keep progress values within the valid percentage range.
  const getProgress = (value) => {
    const progress = Number(value);

    if (!Number.isFinite(progress)) {
      return 0;
    }

    return Math.min(100, Math.max(0, Math.round(progress)));
  };

  const uploadPercentage = getProgress(uploadProgress);
  const processingPercentage = getProgress(processingProgress);

  const progressBar = (percentage) => (
    <div
      className="h-2 overflow-hidden rounded-full bg-gray-800"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="
          h-full
          rounded-full
          bg-red-600
          transition-[width]
          duration-300
          ease-out
        "
        style={{
          width: `${percentage}%`,
        }}
      />
    </div>
  );

  return (
    <div
      className="
        rounded-xl
        border
        border-gray-800
        bg-[#111318]
        p-5
      "
    >
      {/* Browser upload */}
      {isUploading && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-300">Uploading video</span>

            <span className="text-sm tabular-nums text-gray-400">
              {uploadPercentage}%
            </span>
          </div>

          {progressBar(uploadPercentage)}
        </div>
      )}

      {/* Backend processing */}
      {isProcessing && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <span className="text-sm text-gray-300">
              {processingStage || "Processing video"}
            </span>

            <span className="shrink-0 text-sm tabular-nums text-gray-400">
              {processingPercentage}%
            </span>
          </div>

          {progressBar(processingPercentage)}

          <p className="mt-2 text-xs text-gray-500">
            Please keep this page open while your video is being processed.
          </p>
        </div>
      )}

      {/* Completed */}
      {isCompleted && (
        <div
          role="status"
          className="flex items-center gap-2 text-sm text-green-400"
        >
          <span>✓</span>
          <span>Your video is ready!</span>
        </div>
      )}

      {/* Failed */}
      {isFailed && (
        <div role="alert" className="text-sm text-red-400">
          Video upload or processing failed. Please try again.
        </div>
      )}
    </div>
  );
};

export default VideoUploadProgress;

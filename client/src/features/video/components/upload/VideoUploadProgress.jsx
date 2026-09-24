const VideoUploadProgress = ({
  uploadProgress,
  processingProgress,
  processingStage,
  uploadStatus,
}) => {
  if (uploadStatus === "idle") {
    return null;
  }

  const isUploading = uploadStatus === "uploading";
  const isProcessing = uploadStatus === "processing";
  const isCompleted = uploadStatus === "completed";

  return (
    <div className="rounded-xl border border-gray-800 bg-[#111318] p-5">
      {/* Browser upload */}
      {isUploading && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-300">Uploading video</span>

            <span className="text-sm text-gray-400">{uploadProgress}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-red-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Backend processing */}
      {isProcessing && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-300">
              {processingStage || "Processing video"}
            </span>

            <span className="text-sm text-gray-400">
              {Math.round(processingProgress)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-red-600 transition-all duration-300"
              style={{
                width: `${processingProgress}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Completed */}
      {isCompleted && (
        <div className="text-sm text-green-400">Your video is ready!</div>
      )}
    </div>
  );
};

export default VideoUploadProgress;

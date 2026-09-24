import { LoaderCircle, Upload } from "lucide-react";

const VideoUploadActions = ({ uploadStatus, disabled, onCancel }) => {
  const isUploading =
    uploadStatus === "uploading" || uploadStatus === "processing";

  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={isUploading}
        className="rounded-lg px-5 py-2.5 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={disabled || isUploading}
        className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? (
          <>
            <LoaderCircle size={17} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload size={17} />
            Upload Video
          </>
        )}
      </button>
    </div>
  );
};

export default VideoUploadActions;

import { Upload } from "lucide-react";

const VideoUploadForm = ({
  title,
  setTitle,
  description,
  setDescription,
  tags,
  setTags,
  videoFile,
  setVideoFile,
  thumbnail,
  setThumbnail,
  disabled,
}) => {
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setVideoFile(file);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setThumbnail(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Video file */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Video
        </label>

        <label
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-[#111318] p-8 text-center transition hover:border-red-600 ${
            disabled ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <Upload size={32} className="mb-3 text-gray-400" />

          <span className="text-sm text-gray-300">
            {videoFile ? videoFile.name : "Choose a video"}
          </span>

          <span className="mt-1 text-xs text-gray-500">
            Select the video you want to upload
          </span>

          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            disabled={disabled}
            className="hidden"
          />
        </label>
      </div>

      {/* Thumbnail */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Thumbnail
        </label>

        <label
          className={`block cursor-pointer rounded-xl border border-dashed border-gray-700 bg-[#111318] p-5 text-center transition hover:border-red-600 ${
            disabled ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <span className="text-sm text-gray-300">
            {thumbnail
              ? thumbnail.name
              : "Choose a thumbnail (optional)"}
          </span>

          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            disabled={disabled}
            className="hidden"
          />
        </label>
      </div>

      {/* Title */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Title
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={disabled}
          placeholder="Enter video title"
          className="w-full rounded-lg border border-gray-700 bg-[#111318] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-red-600"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Description
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled}
          rows={6}
          placeholder="Tell viewers about your video"
          className="w-full resize-none rounded-lg border border-gray-700 bg-[#111318] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-red-600"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Tags
        </label>

        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={disabled}
          placeholder="javascript, react, web development"
          className="w-full rounded-lg border border-gray-700 bg-[#111318] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-red-600"
        />

        <p className="mt-2 text-xs text-gray-500">
          Separate tags with commas.
        </p>
      </div>
    </div>
  );
};

export default VideoUploadForm;
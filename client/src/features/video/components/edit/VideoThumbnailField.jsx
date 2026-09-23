const VideoThumbnailField = ({ existingVideo, thumbnail, setThumbnail }) => {
  const thumbnailPreview = thumbnail
    ? URL.createObjectURL(thumbnail)
    : existingVideo.thumbnail;

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-200">
        Thumbnail
      </label>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#08090b]">
        <img
          src={thumbnailPreview}
          alt={existingVideo.title}
          className="aspect-video w-full object-cover"
        />
      </div>

      <label
        className="
          mt-3
          inline-flex
          cursor-pointer
          items-center
          rounded-lg
          border
          border-white/10
          px-4
          py-2
          text-sm
          font-medium
          text-gray-300
          transition
          hover:bg-white/5
          hover:text-white
        "
      >
        Change Thumbnail
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
        />
      </label>

      {thumbnail && (
        <p className="mt-2 text-xs text-gray-500">
          New thumbnail: {thumbnail.name}
        </p>
      )}
    </div>
  );
};

export default VideoThumbnailField;

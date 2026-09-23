const VideoVisibilityToggle = ({ isPublished, setIsPublished }) => {
  return (
    <div
      className="
        mt-6
        rounded-xl
        border
        border-white/10
        bg-[#08090b]
        p-4
      "
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-200">Publish Video</p>

          <p className="mt-1 text-xs text-gray-500">
            Published videos are visible to other users.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPublished(!isPublished)}
          className={`
            relative
            h-6
            w-11
            shrink-0
            rounded-full
            transition
            ${isPublished ? "bg-red-600" : "bg-white/10"}
          `}
          aria-label="Toggle video visibility"
        >
          <span
            className={`
              absolute
              top-1
              h-4
              w-4
              rounded-full
              bg-white
              transition
              ${isPublished ? "left-6" : "left-1"}
            `}
          />
        </button>
      </div>

      <div className="mt-3">
        <span
          className={`
            inline-flex
            rounded-full
            px-2.5
            py-1
            text-xs
            font-medium
            ${
              isPublished
                ? "bg-red-600/10 text-red-500"
                : "bg-white/5 text-gray-400"
            }
          `}
        >
          {isPublished ? "Published" : "Unpublished"}
        </span>
      </div>
    </div>
  );
};

export default VideoVisibilityToggle;

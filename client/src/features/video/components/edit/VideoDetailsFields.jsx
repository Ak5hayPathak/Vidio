const VideoDetailsFields = ({
  title,
  setTitle,
  description,
  setDescription,
  tags,
  setTags,
}) => {
  return (
    <>
      {/* Title */}
      <div className="mt-6">
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Title
        </label>

        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter video title"
          className="
            h-11
            w-full
            rounded-xl
            border
            border-white/10
            bg-[#08090b]
            px-4
            text-sm
            text-white
            outline-none
            placeholder:text-gray-500
            transition
            focus:border-red-600
          "
        />
      </div>

      {/* Description */}
      <div className="mt-6">
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Description
        </label>

        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell viewers about your video..."
          rows={7}
          className="
            w-full
            resize-none
            rounded-xl
            border
            border-white/10
            bg-[#08090b]
            px-4
            py-3
            text-sm
            leading-6
            text-white
            outline-none
            placeholder:text-gray-500
            transition
            focus:border-red-600
          "
        />
      </div>

      {/* Tags */}
      <div className="mt-6">
        <label
          htmlFor="tags"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Tags
        </label>

        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="javascript, react, mern"
          className="
            h-11
            w-full
            rounded-xl
            border
            border-white/10
            bg-[#08090b]
            px-4
            text-sm
            text-white
            outline-none
            placeholder:text-gray-500
            transition
            focus:border-red-600
          "
        />

        <p className="mt-2 text-xs text-gray-500">
          Separate tags with commas.
        </p>
      </div>
    </>
  );
};

export default VideoDetailsFields;
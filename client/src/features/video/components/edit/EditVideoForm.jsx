import { Link } from "react-router-dom";

import VideoThumbnailField from "./VideoThumbnailField.jsx";
import VideoDetailsFields from "./VideoDetailsFields.jsx";
import VideoVisibilityToggle from "./VideoVisibilityToggle.jsx";

const EditVideoForm = ({
  existingVideo,
  title,
  setTitle,
  description,
  setDescription,
  tags,
  setTags,
  isPublished,
  setIsPublished,
  thumbnail,
  setThumbnail,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="
        rounded-2xl
        border
        border-white/10
        bg-[#111318]
        p-5
        sm:p-6
      "
    >
      <VideoThumbnailField
        existingVideo={existingVideo}
        thumbnail={thumbnail}
        setThumbnail={setThumbnail}
      />

      <VideoDetailsFields
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        tags={tags}
        setTags={setTags}
      />

      <VideoVisibilityToggle
        isPublished={isPublished}
        setIsPublished={setIsPublished}
      />

      <div
        className="
          mt-8
          flex
          flex-col-reverse
          gap-3
          border-t
          border-white/10
          pt-6
          sm:flex-row
          sm:justify-end
        "
      >
        <Link
          to="/your-videos"
          className="
            rounded-full
            border
            border-white/10
            px-6
            py-2.5
            text-center
            text-sm
            font-medium
            text-gray-300
            transition
            hover:bg-white/5
            hover:text-white
          "
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="
            rounded-full
            bg-red-600
            px-6
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-red-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EditVideoForm;

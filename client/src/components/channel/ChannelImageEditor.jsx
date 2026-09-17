import { Plus } from "lucide-react";

function ChannelImageEditor({
  user,
  avatarPreview,
  coverPreview,
  avatar,
  coverImage,
  filesLoading,
  filesError,
  filesMessage,
  onAvatarChange,
  onCoverChange,
  onSave,
}) {
  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-[#111318]
      "
    >
      {/* Cover */}
      <div className="relative">
        {coverPreview ? (
          <img
            src={coverPreview}
            alt="Channel cover"
            className="h-48 w-full object-cover sm:h-56"
          />
        ) : (
          <div className="h-48 w-full bg-[#181a20] sm:h-56" />
        )}

        <label
          className="
            absolute
            right-4
            top-4
            cursor-pointer
            rounded-lg
            border
            border-white/10
            bg-[#08090b]/80
            px-4
            py-2
            text-sm
            font-medium
            text-white
            backdrop-blur
            transition
            hover:bg-[#08090b]
          "
        >
          Change Cover

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onCoverChange}
          />
        </label>
      </div>

      {/* Avatar */}
      <div className="px-5 pb-6 sm:px-6">
        <div className="-mt-12 flex items-end justify-between">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={user.fullName}
                className="
                  h-24
                  w-24
                  rounded-full
                  border-4
                  border-[#111318]
                  object-cover
                  sm:h-28
                  sm:w-28
                "
              />
            ) : (
              <div
                className="
                  flex
                  h-24
                  w-24
                  items-center
                  justify-center
                  rounded-full
                  border-4
                  border-[#111318]
                  bg-gray-800
                  text-2xl
                  font-semibold
                  sm:h-28
                  sm:w-28
                "
              >
                {user.username?.charAt(0).toUpperCase()}
              </div>
            )}

            <label
              className="
                absolute
                bottom-0
                right-0
                flex
                h-8
                w-8
                cursor-pointer
                items-center
                justify-center
                rounded-full
                border
                border-[#111318]
                bg-red-600
                text-white
                transition
                hover:bg-red-700
              "
              title="Change avatar"
            >
              <Plus size={16} />

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarChange}
              />
            </label>
          </div>
        </div>

        {/* Selected files */}
        {(avatar || coverImage) && (
          <p className="mt-4 text-xs text-gray-500">
            {avatar && coverImage
              ? "New avatar and cover image selected."
              : avatar
                ? `New avatar: ${avatar.name}`
                : `New cover image: ${coverImage.name}`}
          </p>
        )}

        {filesError && (
          <p className="mt-4 text-sm text-red-400">{filesError}</p>
        )}

        {filesMessage && (
          <p className="mt-4 text-sm text-green-400">{filesMessage}</p>
        )}

        {/* Save */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onSave}
            disabled={(!avatar && !coverImage) || filesLoading}
            className="
              rounded-full
              bg-red-600
              px-5
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
            {filesLoading ? "Saving..." : "Save Images"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default ChannelImageEditor;
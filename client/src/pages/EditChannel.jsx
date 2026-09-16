import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext.jsx";
import api from "../services/api.js";

const UPDATE_DETAILS_ROUTE = "/users/update-details";
const UPDATE_FILES_ROUTE = "/users/update-files";

const EditChannel = () => {
  const { user, setUser, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);

  const [detailsMessage, setDetailsMessage] = useState("");
  const [detailsError, setDetailsError] = useState("");

  const [filesMessage, setFilesMessage] = useState("");
  const [filesError, setFilesError] = useState("");

  /*
   * Populate the form with the authenticated user's data.
   */
  useEffect(() => {
    if (!user) return;

    setFullName(user.fullName || "");
    setUsername(user.username || "");
  }, [user]);

  /*
   * Update account details.
   */
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();

    setDetailsMessage("");
    setDetailsError("");

    if (!fullName.trim() && !username.trim()) {
      setDetailsError("At least one field is required.");
      return;
    }

    try {
      setDetailsLoading(true);

      const response = await api.patch(UPDATE_DETAILS_ROUTE, {
        fullName: fullName.trim(),
        username: username.trim(),
      });

      const updatedUser = response.data.data;

      setUser(updatedUser);

      setDetailsMessage(
        response.data.message || "Account details updated successfully.",
      );
    } catch (error) {
      console.error("Failed to update account details:", error);

      setDetailsError(
        error.response?.data?.message || "Unable to update account details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  /*
   * Update avatar and/or cover image.
   */
  const handleFilesSubmit = async (e) => {
    e.preventDefault();

    setFilesMessage("");
    setFilesError("");

    if (!avatar && !coverImage) {
      setFilesError("Please select at least one image.");
      return;
    }

    try {
      setFilesLoading(true);

      const formData = new FormData();

      if (avatar) {
        formData.append("avatar", avatar);
      }

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const response = await api.patch(UPDATE_FILES_ROUTE, formData);

      const updatedUser = response.data.data;

      setUser(updatedUser);

      setAvatar(null);
      setCoverImage(null);

      setFilesMessage(
        response.data.message || "Profile images updated successfully.",
      );
    } catch (error) {
      console.error("Failed to update profile images:", error);

      setFilesError(
        error.response?.data?.message || "Unable to update profile images.",
      );
    } finally {
      setFilesLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090b] text-white">
        <p className="text-sm text-gray-400">Loading channel...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090b] px-6 text-center text-white">
        <div>
          <h1 className="text-xl font-semibold">
            Please log in to edit your channel.
          </h1>

          <Link
            to="/login"
            className="
              mt-5
              inline-block
              rounded-xl
              bg-red-600
              px-5
              py-2.5
              text-sm
              font-semibold
              transition
              hover:bg-red-700
            "
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  /*
   * Preview URLs.
   */
  const avatarPreview = avatar ? URL.createObjectURL(avatar) : user.avatar;

  const coverPreview = coverImage
    ? URL.createObjectURL(coverImage)
    : user.coverImage;

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/channel"
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                text-sm
                text-gray-400
                transition
                hover:text-white
              "
            >
              ← Back to Channel
            </Link>

            <h1 className="text-2xl font-bold sm:text-3xl">Edit Channel</h1>

            <p className="mt-1 text-sm text-gray-500">
              Update your channel information and appearance.
            </p>
          </div>

          {/* Channel Images */}
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
                  className="
                    h-48
                    w-full
                    object-cover
                    sm:h-56
                  "
                />
              ) : (
                <div
                  className="
                    h-48
                    w-full
                    bg-[#181a20]
                    sm:h-56
                  "
                />
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
                  onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
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
                      text-sm
                      font-bold
                      transition
                      hover:bg-red-700
                    "
                    title="Change avatar"
                  >
                    +
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setAvatar(e.target.files?.[0] || null)}
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

              {/* File errors */}
              {filesError && (
                <p className="mt-4 text-sm text-red-400">{filesError}</p>
              )}

              {/* File success */}
              {filesMessage && (
                <p className="mt-4 text-sm text-green-400">{filesMessage}</p>
              )}

              {/* Save Images */}
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleFilesSubmit}
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

          {/* Account Details */}
          <form
            onSubmit={handleDetailsSubmit}
            className="
              mt-6
              rounded-2xl
              border
              border-white/10
              bg-[#111318]
              p-5
              sm:p-6
            "
          >
            <div>
              <h2 className="text-lg font-semibold">Channel Details</h2>

              <p className="mt-1 text-sm text-gray-500">
                Update your name and username.
              </p>
            </div>

            {/* Full Name */}
            <div className="mt-6">
              <label
                htmlFor="fullName"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-gray-200
                "
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
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

            {/* Username */}
            <div className="mt-6">
              <label
                htmlFor="username"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-gray-200
                "
              >
                Username
              </label>

              <div className="flex">
                <span
                  className="
                    flex
                    h-11
                    items-center
                    rounded-l-xl
                    border
                    border-r-0
                    border-white/10
                    bg-[#111318]
                    px-3
                    text-sm
                    text-gray-500
                  "
                >
                  @
                </span>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="
                    h-11
                    min-w-0
                    flex-1
                    rounded-r-xl
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

              <p className="mt-2 text-xs text-gray-500">
                Your username must be unique.
              </p>
            </div>

            {/* Details Error */}
            {detailsError && (
              <p className="mt-5 text-sm text-red-400">{detailsError}</p>
            )}

            {/* Details Success */}
            {detailsMessage && (
              <p className="mt-5 text-sm text-green-400">{detailsMessage}</p>
            )}

            {/* Save */}
            <div
              className="
                mt-8
                flex
                justify-end
                border-t
                border-white/10
                pt-6
              "
            >
              <button
                type="submit"
                disabled={
                  detailsLoading ||
                  (fullName.trim() === (user?.fullName || "").trim() &&
                    username.trim() === (user?.username || "").trim())
                }
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
                {detailsLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditChannel;

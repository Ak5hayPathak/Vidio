import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "../../../context/AuthContext.jsx";

import ChannelLoading from "../components/ChannelLoading.jsx";
import ChannelLoggedOut from "../components/ChannelLoggedOut.jsx";
import ChannelImageEditor from "../components/ChannelImageEditor.jsx";
import ChannelDetailsForm from "../components/ChannelDetailsForm.jsx";

import {
  updateChannelDetails,
  updateChannelFiles,
} from "../channel.service.js";

function EditChannel() {
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

  useEffect(() => {
    if (!user) return;

    setFullName(user.fullName || "");
    setUsername(user.username || "");
  }, [user]);

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

      const response = await updateChannelDetails(
        fullName.trim(),
        username.trim(),
      );

      const updatedUser = response.data;

      setUser(updatedUser);

      setDetailsMessage(
        response.message || "Account details updated successfully.",
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

  const handleFilesSubmit = async () => {
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

      const response = await updateChannelFiles(formData);

      const updatedUser = response.data;

      setUser(updatedUser);

      setAvatar(null);
      setCoverImage(null);

      setFilesMessage(
        response.message || "Profile images updated successfully.",
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
    return <ChannelLoading />;
  }

  if (!user) {
    return <ChannelLoggedOut />;
  }

  const avatarPreview = avatar
    ? URL.createObjectURL(avatar)
    : user.avatar;

  const coverPreview = coverImage
    ? URL.createObjectURL(coverImage)
    : user.coverImage;

  const detailsChanged =
    fullName.trim() !== (user.fullName || "").trim() ||
    username.trim() !== (user.username || "").trim();

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
              <ArrowLeft size={18} />
              Back to Channel
            </Link>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Edit Channel
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update your channel information and appearance.
            </p>
          </div>

          <ChannelImageEditor
            user={user}
            avatarPreview={avatarPreview}
            coverPreview={coverPreview}
            avatar={avatar}
            coverImage={coverImage}
            filesLoading={filesLoading}
            filesError={filesError}
            filesMessage={filesMessage}
            onAvatarChange={(e) =>
              setAvatar(e.target.files?.[0] || null)
            }
            onCoverChange={(e) =>
              setCoverImage(e.target.files?.[0] || null)
            }
            onSave={handleFilesSubmit}
          />

          <ChannelDetailsForm
            fullName={fullName}
            username={username}
            detailsLoading={detailsLoading}
            detailsError={detailsError}
            detailsMessage={detailsMessage}
            detailsChanged={detailsChanged}
            onFullNameChange={(e) => setFullName(e.target.value)}
            onUsernameChange={(e) => setUsername(e.target.value)}
            onSubmit={handleDetailsSubmit}
          />
        </div>
      </main>
    </div>
  );
}

export default EditChannel;
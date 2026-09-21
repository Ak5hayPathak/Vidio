import { useEffect, useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import api from "../../../services/api.js";

function ChannelAbout({
  about = "",
  onAboutUpdate,
  isOwner = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(about);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setValue(about);
  }, [about]);

  const handleEdit = () => {
    if (!isOwner) return;

    setValue(about);
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setValue(about);
    setError("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!isOwner) return;

    const trimmedValue = value.trim();

    if (trimmedValue.length > 5000) {
      setError("About cannot exceed 5000 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.patch(
        "/users/update-about",
        {
          about: trimmedValue,
        },
      );

      const updatedAbout =
        response.data.data.about;

      setValue(updatedAbout);
      setIsEditing(false);

      onAboutUpdate?.(updatedAbout);
    } catch (err) {
      console.error(
        "Failed to update about:",
        err,
      );

      setError(
        err.response?.data?.message ||
          "Unable to update your About section.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-8">
      <div
        className="
          max-w-3xl
          rounded-2xl
          border
          border-white/10
          bg-white/[0.02]
          p-6
        "
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">
            About
          </h2>

          {isOwner && !isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                border
                border-white/10
                bg-white/5
                px-3
                py-2
                text-sm
                font-medium
                text-gray-300
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              <Pencil size={15} />
              Edit
            </button>
          )}
        </div>

        {isEditing && isOwner ? (
          <div className="mt-5">
            <textarea
              value={value}
              onChange={(e) => {
                setValue(e.target.value);

                if (error) {
                  setError("");
                }
              }}
              maxLength={5000}
              rows={8}
              autoFocus
              placeholder="Tell people a little about yourself..."
              className="
                w-full
                resize-y
                rounded-xl
                border
                border-white/10
                bg-black/20
                px-4
                py-3
                text-sm
                leading-6
                text-white
                outline-none
                placeholder:text-gray-600
                focus:border-red-600/60
              "
            />

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {value.length}/5000
              </span>

              {error && (
                <span className="text-xs text-red-400">
                  {error}
                </span>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-white/10
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-gray-400
                  transition
                  hover:bg-white/5
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <X size={15} />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-red-600
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Check size={15} />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            {about ? (
              <p className="whitespace-pre-wrap text-sm leading-7 text-gray-300">
                {about}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                {isOwner
                  ? "You haven't added an About section yet."
                  : "This channel hasn't added an About section yet."}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default ChannelAbout;
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import api from "../services/api.js";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/users/change-password", {
        currentPassword,
        newPassword,
      });

      setSuccess(true);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        {/* Back */}
        <Link
          to="/settings"
          className="
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
          Back to Settings
        </Link>

        {/* Card */}
        <div
          className="
            mt-6
            rounded-2xl
            border
            border-white/10
            bg-[#111318]
            p-6
            sm:p-8
          "
        >
          {/* Header */}
          <div>
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-red-600/10
                text-red-500
              "
            >
              <Lock size={22} />
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Change Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Update your password to keep your account secure.
            </p>
          </div>

          {/* Success */}
          {success && (
            <div
              className="
                mt-6
                rounded-xl
                border
                border-green-500/20
                bg-green-500/10
                px-4
                py-3
                text-sm
                text-green-400
              "
            >
              Your password has been changed successfully.
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="
                mt-6
                rounded-xl
                border
                border-red-500/20
                bg-red-500/10
                px-4
                py-3
                text-sm
                text-red-400
              "
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Current Password
              </label>

              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-[#08090b]
                    px-4
                    pr-12
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-gray-500
                    transition
                    focus:border-red-600
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(!showCurrentPassword)
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                    transition
                    hover:text-white
                  "
                  aria-label={
                    showCurrentPassword
                      ? "Hide current password"
                      : "Show current password"
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                New Password
              </label>

              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-[#08090b]
                    px-4
                    pr-12
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-gray-500
                    transition
                    focus:border-red-600
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(!showNewPassword)
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                    transition
                    hover:text-white
                  "
                  aria-label={
                    showNewPassword
                      ? "Hide new password"
                      : "Show new password"
                  }
                >
                  {showNewPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                At least 8 characters with uppercase, lowercase, and a number.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-[#08090b]
                    px-4
                    pr-12
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-gray-500
                    transition
                    focus:border-red-600
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                    transition
                    hover:text-white
                  "
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                loading ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="
                w-full
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
              {loading ? "Changing Password..." : "Change Password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChangePassword;
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";

import { changePassword } from "../settings.service.js";

import {
  validatePasswordChange,
} from "../settings.utils.js";

import ChangePasswordForm from "../components/ChangePasswordForm.jsx";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    const validationError =
      validatePasswordChange(
        currentPassword,
        newPassword,
        confirmPassword,
      );

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      await changePassword(
        currentPassword,
        newPassword,
      );

      setSuccess(true);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to change password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">

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
              Update your password to keep your account
              secure.
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

          <ChangePasswordForm
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            setCurrentPassword={setCurrentPassword}
            setNewPassword={setNewPassword}
            setConfirmPassword={setConfirmPassword}
            loading={loading}
            onSubmit={handleSubmit}
          />
        </div>
      </main>
    </div>
  );
};

export default ChangePassword;
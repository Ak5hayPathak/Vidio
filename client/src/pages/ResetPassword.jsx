import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";

import api from "../services/api.js";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/users/reset-password/${token}`, {
        newPassword,
        confirmPassword,
      });

      setMessage(
        response.data.message || "Password reset successfully!",
      );

      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Reset password failed:", error);

      setError(
        error.response?.data?.message ||
          "Unable to reset password. The link may be invalid or expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Password successfully reset
  if (message) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090b] px-4 py-10 text-white">
        <div className="w-full max-w-md text-center">
          <div
            className="
              mx-auto
              mb-5
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-green-500/10
              text-green-500
            "
          >
            <CheckCircle size={28} />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Password reset!
          </h1>

          <p className="mt-3 text-gray-500">
            Your password has been successfully reset. You can now sign in
            with your new password.
          </p>

          <Link
            to="/login"
            className="
              mt-8
              flex
              h-12
              w-full
              items-center
              justify-center
              rounded-xl
              bg-red-600
              font-medium
              text-white
              transition
              hover:bg-red-500
            "
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08090b] px-4 py-10 text-white">
      <div className="w-full max-w-md">
        {/* Back */}
        <Link
          to="/login"
          className="
            mb-8
            inline-flex
            items-center
            gap-2
            text-sm
            text-gray-500
            transition
            hover:text-white
          "
        >
          <ArrowLeft size={17} />
          Back to login
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <div
            className="
              mx-auto
              mb-5
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-red-600/10
              text-red-500
            "
          >
            <Lock size={22} />
          </div>

          <h1 className="text-center text-3xl font-semibold tracking-tight">
            Create a new password
          </h1>

          <p className="mt-2 text-center text-gray-500">
            Enter your new password below to secure your account.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="
              mb-5
              rounded-xl
              border
              border-red-500/20
              bg-red-500/10
              px-4
              py-3
              text-sm
              leading-5
              text-red-400
            "
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              New password
            </label>

            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter your new password"
                autoComplete="new-password"
                required
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-[#111317]
                  px-4
                  pr-12
                  text-white
                  placeholder:text-gray-600
                  outline-none
                  transition
                  focus:border-red-500/60
                  focus:ring-2
                  focus:ring-red-500/10
                "
              />

              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-500
                  transition
                  hover:text-gray-300
                "
                aria-label={
                  showNewPassword
                    ? "Hide new password"
                    : "Show new password"
                }
              >
                {showNewPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Confirm password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                placeholder="Confirm your new password"
                autoComplete="new-password"
                required
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-[#111317]
                  px-4
                  pr-12
                  text-white
                  placeholder:text-gray-600
                  outline-none
                  transition
                  focus:border-red-500/60
                  focus:ring-2
                  focus:ring-red-500/10
                "
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-500
                  transition
                  hover:text-gray-300
                "
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              h-12
              w-full
              rounded-xl
              bg-red-600
              font-medium
              text-white
              shadow-lg
              shadow-red-600/10
              transition
              hover:bg-red-500
              active:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
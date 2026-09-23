import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

import { forgotPassword } from "../auth.service.js";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await forgotPassword(email);

      setMessage(
        response.message ||
          "If an account exists with this email, a password reset link has been sent.",
      );
    } catch (error) {
      console.error("Forgot password failed:", error);

      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
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
            <Mail size={22} />
          </div>

          <h1 className="text-center text-3xl font-semibold tracking-tight">
            Forgot your password?
          </h1>

          <p className="mt-2 text-center text-gray-500">
            Enter your email address and we'll send you a link to reset your
            password.
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

        {/* Success */}
        {message && (
          <div
            className="
              mb-5
              rounded-xl
              border
              border-green-500/20
              bg-green-500/10
              px-4
              py-3
              text-sm
              leading-5
              text-green-400
            "
          >
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setMessage("");
              }}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="
                h-12
                w-full
                rounded-xl
                border
                border-white/[0.08]
                bg-[#111317]
                px-4
                text-white
                placeholder:text-gray-600
                outline-none
                transition
                focus:border-red-500/60
                focus:ring-2
                focus:ring-red-500/10
              "
            />
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
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {/* Login */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-gray-300 transition hover:text-red-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;

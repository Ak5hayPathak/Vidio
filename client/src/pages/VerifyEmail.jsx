import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/home/Navbar.jsx";
import api from "../services/api.js";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState(token ? "verifying" : "waiting");
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);

  // Prevent duplicate verification requests in React StrictMode
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (!token || verificationAttempted.current) return;

    verificationAttempted.current = true;

    const verifyEmail = async () => {
      try {
        const response = await api.get(`/users/verify-email/${token}`);

        setStatus("success");
        setMessage(
          response.data.message ||
            "Your email has been verified successfully.",
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Unable to verify your email. The verification link may be invalid or expired.",
        );
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    setResending(true);
    setMessage("");

    try {
      await api.post("/users/resend-verification-email", {
        email: email.trim(),
      });

      setMessage(
        "A new verification email has been sent. Please check your inbox.",
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to resend verification email.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <Navbar />

      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-[#111318]
              p-6
              sm:p-8
            "
          >
            {/* Verifying */}
            {status === "verifying" && (
              <div className="text-center">
                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-red-600/10
                    text-2xl
                    text-red-500
                  "
                >
                  ↻
                </div>

                <h1 className="mt-5 text-2xl font-bold">
                  Verifying Email
                </h1>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Please wait while we verify your email address.
                </p>
              </div>
            )}

            {/* Success */}
            {status === "success" && (
              <div className="text-center">
                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-green-500/10
                    text-2xl
                    text-green-500
                  "
                >
                  ✓
                </div>

                <h1 className="mt-5 text-2xl font-bold">
                  Email Verified
                </h1>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {message}
                </p>

                <Link
                  to="/login"
                  className="
                    mt-6
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    rounded-full
                    bg-red-600
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-red-700
                  "
                >
                  Continue to Login
                </Link>
              </div>
            )}

            {/* Error */}
            {status === "error" && (
              <div className="text-center">
                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-red-600/10
                    text-2xl
                    text-red-500
                  "
                >
                  !
                </div>

                <h1 className="mt-5 text-2xl font-bold">
                  Verification Failed
                </h1>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {message}
                </p>

                <Link
                  to="/verify-email"
                  className="
                    mt-6
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    rounded-full
                    bg-red-600
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-red-700
                  "
                >
                  Try Again
                </Link>
              </div>
            )}

            {/* Waiting / Resend */}
            {status === "waiting" && (
              <>
                <div className="text-center">
                  <div
                    className="
                      mx-auto
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-red-600/10
                      text-2xl
                      text-red-500
                    "
                  >
                    ✉
                  </div>

                  <h1 className="mt-5 text-2xl font-bold">
                    Verify Your Email
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    Enter your email address and we'll send you a new
                    verification link.
                  </p>
                </div>

                <form onSubmit={handleResend} className="mt-6">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-200"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
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

                  <button
                    type="submit"
                    disabled={resending || !email.trim()}
                    className="
                      mt-4
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
                    {resending
                      ? "Sending..."
                      : "Resend Verification Email"}
                  </button>
                </form>

                {message && (
                  <p className="mt-4 text-center text-sm text-gray-400">
                    {message}
                  </p>
                )}

                <div className="mt-6 border-t border-white/10 pt-5 text-center">
                  <p className="text-sm text-gray-500">
                    Already verified?
                  </p>

                  <Link
                    to="/login"
                    className="
                      mt-1
                      inline-block
                      text-sm
                      font-medium
                      text-red-500
                      transition
                      hover:text-red-400
                    "
                  >
                    Go to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;

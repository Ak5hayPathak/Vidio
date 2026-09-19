import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/navbar/Navbar.jsx";
import api from "../services/api.js";

const VerifyEmailChange = () => {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [status, setStatus] = useState(
    token ? "verifying" : "error",
  );

  const [message, setMessage] = useState("");

  // Prevent duplicate verification requests in React StrictMode
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (!token || verificationAttempted.current) return;

    verificationAttempted.current = true;

    const verifyEmailChange = async () => {
      try {
        const response = await api.post(
          `/users/verify-changed-email/${token}`,
        );

        setStatus("success");

        setMessage(
          response.data.message ||
            "Your email address has been changed successfully.",
        );
      } catch (error) {
        setStatus("error");

        setMessage(
          error.response?.data?.message ||
            "Unable to change your email. The verification link may be invalid or expired.",
        );
      }
    };

    verifyEmailChange();
  }, [token]);

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
                  Confirming New Email
                </h1>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Please wait while we confirm your new email
                  address.
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
                  Email Changed Successfully
                </h1>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {message}
                </p>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Your session has been signed out for security.
                  Please log in again using your new email address.
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
                  {message ||
                    "Invalid or expired email verification link."}
                </p>

                <Link
                  to="/account/change-email"
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
                  Back to Change Email
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmailChange;
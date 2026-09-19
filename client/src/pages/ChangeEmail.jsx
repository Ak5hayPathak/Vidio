import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

import api from "../services/api.js";

const ChangeEmail = () => {
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const current = currentEmail.trim().toLowerCase();
    const next = newEmail.trim().toLowerCase();

    if (!current || !next) {
      setError("Please enter both email addresses");
      return;
    }

    if (current === next) {
      setError(
        "New email must be different from your current email"
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/users/change-email", {
        currentEmail: current,
        newEmail: next,
      });

      setSubmitted(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to change email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#08090b] px-4 py-10 text-white">
        <div className="mx-auto w-full max-w-md">
          <Link
            to="/settings"
            className="
              mb-8
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
              rounded-2xl
              border
              border-white/10
              bg-[#111318]
              p-6
            "
          >
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
                text-red-500
              "
            >
              <Mail size={26} />
            </div>

            <div className="mt-5 text-center">
              <h1 className="text-xl font-semibold">
                Check your email
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                We've sent a verification link to your new email
                address.
              </p>

              <p className="mt-4 text-sm text-gray-500">
                Your email address won't change until you verify
                the link.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                The verification link expires in 30 minutes.
              </p>
            </div>

            <Link
              to="/settings"
              className="
                mt-6
                block
                w-full
                rounded-lg
                bg-red-600
                px-4
                py-3
                text-center
                text-sm
                font-medium
                text-white
                transition
                hover:bg-red-700
              "
            >
              Back to Settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090b] px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/settings"
          className="
            mb-8
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
            rounded-2xl
            border
            border-white/10
            bg-[#111318]
            p-6
          "
        >
          <div>
            <h1 className="text-xl font-semibold">
              Change email
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Enter your current email address and the new email
              address you'd like to use.
            </p>
          </div>

          {error && (
            <div
              className="
                mt-5
                rounded-lg
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

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="currentEmail"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-gray-300
                "
              >
                Current email
              </label>

              <input
                id="currentEmail"
                type="email"
                value={currentEmail}
                onChange={(e) =>
                  setCurrentEmail(e.target.value)
                }
                placeholder="Enter your current email"
                autoComplete="email"
                disabled={loading}
                className="
                  w-full
                  rounded-lg
                  border
                  border-white/10
                  bg-[#08090b]
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-gray-600
                  transition
                  focus:border-red-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              />
            </div>

            <div>
              <label
                htmlFor="newEmail"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-gray-300
                "
              >
                New email
              </label>

              <input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) =>
                  setNewEmail(e.target.value)
                }
                placeholder="Enter your new email"
                autoComplete="email"
                disabled={loading}
                className="
                  w-full
                  rounded-lg
                  border
                  border-white/10
                  bg-[#08090b]
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-gray-600
                  transition
                  focus:border-red-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              />
            </div>

            <div
              className="
                rounded-lg
                border
                border-white/10
                bg-white/[0.02]
                p-4
              "
            >
              <p className="text-sm leading-5 text-gray-400">
                We'll send a verification link to your new email
                address. Your current email will remain active
                until you verify it.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-lg
                bg-red-600
                px-4
                py-3
                text-sm
                font-medium
                text-white
                transition
                hover:bg-red-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Sending..."
                : "Send verification email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangeEmail;
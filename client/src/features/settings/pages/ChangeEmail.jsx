import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { changeEmail } from "../settings.service.js";

import { normalizeEmail, validateEmailChange } from "../settings.utils.js";

import ChangeEmailForm from "../components/ChangeEmailForm.jsx";
import EmailChangeSuccess from "../components/EmailChangeSuccess.jsx";

const ChangeEmail = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (currentEmail, newEmail) => {
    setError("");

    const current = normalizeEmail(currentEmail);
    const next = normalizeEmail(newEmail);

    const validationError = validateEmailChange(current, next);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      await changeEmail(current, next);

      setSubmitted(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to change email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

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
          {submitted ? (
            <EmailChangeSuccess />
          ) : (
            <>
              <div>
                <h1 className="text-xl font-semibold">Change email</h1>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Enter your current email address and the new email address
                  you'd like to use.
                </p>
              </div>

              <ChangeEmailForm
                loading={loading}
                error={error}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangeEmail;

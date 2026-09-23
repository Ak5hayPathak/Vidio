import { useState } from "react";

function ChangeEmailForm({ loading, error, onSubmit }) {
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(currentEmail, newEmail);
  };

  return (
    <>
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

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
            onChange={(e) => setCurrentEmail(e.target.value)}
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
            onChange={(e) => setNewEmail(e.target.value)}
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
            We'll send a verification link to your new email address. Your
            current email will remain active until you verify it.
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
          {loading ? "Sending..." : "Send verification email"}
        </button>
      </form>
    </>
  );
}

export default ChangeEmailForm;

function ChannelDetailsForm({
  fullName,
  username,
  detailsLoading,
  detailsError,
  detailsMessage,
  detailsChanged,
  onFullNameChange,
  onUsernameChange,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="
        mt-6
        rounded-2xl
        border
        border-white/10
        bg-[#111318]
        p-5
        sm:p-6
      "
    >
      <div>
        <h2 className="text-lg font-semibold">Channel Details</h2>

        <p className="mt-1 text-sm text-gray-500">
          Update your name and username.
        </p>
      </div>

      {/* Full Name */}
      <div className="mt-6">
        <label
          htmlFor="fullName"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Full Name
        </label>

        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={onFullNameChange}
          placeholder="Enter your full name"
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
      </div>

      {/* Username */}
      <div className="mt-6">
        <label
          htmlFor="username"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Username
        </label>

        <div className="flex">
          <span
            className="
              flex
              h-11
              items-center
              rounded-l-xl
              border
              border-r-0
              border-white/10
              bg-[#111318]
              px-3
              text-sm
              text-gray-500
            "
          >
            @
          </span>

          <input
            id="username"
            type="text"
            value={username}
            onChange={onUsernameChange}
            placeholder="username"
            className="
              h-11
              min-w-0
              flex-1
              rounded-r-xl
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
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Your username must be unique.
        </p>
      </div>

      {/* Messages */}
      {detailsError && (
        <p className="mt-5 text-sm text-red-400">{detailsError}</p>
      )}

      {detailsMessage && (
        <p className="mt-5 text-sm text-green-400">{detailsMessage}</p>
      )}

      {/* Save */}
      <div
        className="
          mt-8
          flex
          justify-end
          border-t
          border-white/10
          pt-6
        "
      >
        <button
          type="submit"
          disabled={detailsLoading || !detailsChanged}
          className="
            rounded-full
            bg-red-600
            px-6
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
          {detailsLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default ChannelDetailsForm;
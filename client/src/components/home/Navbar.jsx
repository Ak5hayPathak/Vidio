import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090b]">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.18-6.86a1 1 0 0 0 0-1.66L9.53 4.29A1 1 0 0 0 8 5.14Z" />
            </svg>
          </div>

          <span className="text-2xl font-bold">Vidio</span>
        </Link>

        {/* Search */}
        <div className="hidden w-full max-w-xl px-8 md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search videos..."
              className="
    h-10
    w-full
    rounded-full
    border
    border-white/10
    bg-[#111318]
    px-5
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
              className="
    absolute
    right-1
    top-1
    flex
    h-8
    w-10
    items-center
    justify-center
    rounded-full
    bg-red-600
    text-white
    transition
    hover:bg-red-700
  "
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Upload */}
          <button
            className="
              hidden
              items-center
              gap-2
              rounded-full
              border
              border-gray-200
              px-4
              py-2
              text-sm
              font-medium
              transition
              hover:bg-gray-100
              sm:flex
            "
          >
            <span className="text-lg">+</span>
            Create
          </button>

          {/* Notification */}
          <button
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              transition
              hover:bg-gray-100
            "
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M15 17h5l-1.5-2v-5a6.5 6.5 0 0 0-13 0v5L4 17h5m6 0a3 3 0 0 1-6 0"
              />
            </svg>
          </button>

          {/* Profile */}
          <button
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-gray-900
              text-sm
              font-semibold
              text-white
            "
          >
            S
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="border-t border-gray-100 px-4 py-3 md:hidden">
        <input
          type="text"
          placeholder="Search videos..."
          className="
            h-10
            w-full
            rounded-full
            border
            border-gray-300
            bg-gray-50
            px-5
            text-sm
            outline-none
            focus:border-gray-500
          "
        />
      </div>
    </header>
  );
}

export default Navbar;

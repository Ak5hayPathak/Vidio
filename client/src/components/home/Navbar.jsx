import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar({ onMenuClick }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const { user } = useAuth();

  const handleSearchFocus = () => {
    setSearchFocused(true);
  };

  const handleBack = () => {
    setSearchFocused(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090b]">
      <div className="flex h-16 items-center gap-2 px-3 sm:px-6">
        {/* =====================================================
            MOBILE / TABLET — FOCUSED SEARCH
            Only shown when search is focused
        ====================================================== */}
        {searchFocused && (
          <div className="flex w-full items-center gap-2 lg:hidden">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                text-gray-300
                transition
                hover:bg-white/10
                hover:text-white
              "
              title="Back"
            >
              ←
            </button>

            {/* Focused Search */}
            <div className="relative min-w-0 flex-1">
              <input
                ref={searchInputRef}
                autoFocus
                type="text"
                placeholder="Search videos..."
                className="
                  h-10
                  w-full
                  rounded-full
                  border
                  border-red-600
                  bg-[#111318]
                  px-4
                  pr-11
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-gray-500
                "
              />

              <button
                className="
                  absolute
                  right-1
                  top-1
                  flex
                  h-8
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-[#CE2029]
                  text-white
                  transition
                  hover:bg-[#CE2029]
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
        )}

        {/* =====================================================
            NORMAL NAVBAR
            Hidden on mobile/tablet while searching
            ALWAYS visible on desktop
        ====================================================== */}
        <div
          className={`
            w-full
            items-center
            gap-2
            ${searchFocused ? "hidden" : "flex"}
            lg:flex
          `}
        >
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-gray-300
              transition
              hover:bg-white/10
              hover:text-white
              lg:hidden
            "
            title="Open sidebar"
          >
            ☰
          </button>

          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex h-7 w-9 items-center justify-center rounded-xl bg-[#CE2029]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.18-6.86a1 1 0 0 0 0-1.66L9.53 4.29A1 1 0 0 0 8 5.14Z" />
              </svg>
            </div>

            <span className="text-xl font-bold text-white">Vidio</span>
          </Link>

          {/* Search */}
          <div className="mx-1 min-w-0 flex-1 md:mx-auto md:max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search videos..."
                onFocus={handleSearchFocus}
                className="
                  h-10
                  w-full
                  rounded-full
                  border
                  border-white/10
                  bg-[#111318]
                  px-4
                  pr-11
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-gray-500
                  transition
                  focus:border-red-600
                  sm:px-5
                "
              />

              <button
                className="
                  absolute
                  right-1
                  top-1
                  flex
                  h-8
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-[#CE2029]
                  text-white
                  transition
                  hover:bg-[#CE2029]
                  sm:w-10
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

          {/* Right Section */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-4">
            {/* Create */}
            <button
              className="
                hidden
                items-center
                gap-2
                rounded-full
                border
                border-white/10
                px-4
                py-2
                text-sm
                font-medium
                text-white
                transition
                hover:bg-white/5
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
                shrink-0
                items-center
                justify-center
                rounded-full
                text-gray-300
                transition
                hover:bg-white/10
                hover:text-white
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
    shrink-0
    items-center
    justify-center
    overflow-hidden
    rounded-full
    bg-gray-900
  "
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-white">
                  {user?.username?.charAt(0).toUpperCase() || "?"}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

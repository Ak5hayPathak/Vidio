import { ChevronLeft } from "lucide-react";

function FocusedSearch({ handleBack, searchFocused, searchInputRef }) {
  return (
    <>
      {/* 
            Mobile/Tablet: focused search
            Only shown when search is focused
     */}
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
            <ChevronLeft size={20} />
          </button>

          {/* Focused Search */}
          <div className="relative min-w-0 flex-1">
            <input
              ref={searchInputRef}
              autoFocus
              type="text"
              placeholder="Search videos, tweets, playlists, or users..."
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
    </>
  );
}

export default FocusedSearch;

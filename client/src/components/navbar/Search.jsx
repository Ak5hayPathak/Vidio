import React from "react";

function Search({ handleSearchFocus }) {
  return (
    <div className="mx-1 min-w-0 flex-1 md:mx-auto md:max-w-lg">
      <div className="relative">
        <input
          type="text"
          placeholder="Search videos, tweets or users..."
          onFocus={handleSearchFocus}
          className="
            h-9
            w-full
            rounded-full
            border
            border-white/10
            bg-[#111318]
            px-3.5
            pr-10
            text-sm
            text-white
            outline-none
            placeholder:text-gray-500
            transition
            focus:border-red-600
            sm:px-4
          "
        />

        <button
          className="
            absolute
            right-1
            top-1
            flex
            h-7
            w-8
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
            className="h-3.5 w-3.5"
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
  );
}

export default Search;
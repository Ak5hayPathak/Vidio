import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function Search({ handleSearchFocus, query, setQuery }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  //const [query, setQuery] = useState(searchParams.get("q") || "");

  function handleSubmit(event) {
    event.preventDefault();

    const normalizedQuery = query.trim();

    if (!normalizedQuery) return;

    navigate(`/search?q=${encodeURIComponent(normalizedQuery)}&type=videos`);

    handleSearchFocus?.(false);
  }

  return (
    <div className="mx-1 min-w-0 flex-1 md:mx-auto md:max-w-lg">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => handleSearchFocus?.(true)}
          placeholder="Search videos, playlists, or users..."
          aria-label="Search Vidio"
          className="
            h-9 w-full rounded-full border border-white/10
            bg-[#111318] px-3.5 pr-12 text-sm text-white
            outline-none placeholder:text-gray-500 transition
            focus:border-red-600 sm:px-4
          "
        />

        <button
          type="submit"
          aria-label="Submit search"
          className="
            absolute right-1 top-1 flex h-7 w-8
            items-center justify-center rounded-full
            bg-[#CE2029] text-white transition hover:bg-red-700
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
      </form>
    </div>
  );
}

export default Search;

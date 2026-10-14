import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function FocusedSearch({
  handleBack,
  searchFocused,
  searchInputRef,
  query,
  setQuery,
}) {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    const normalizedQuery = query.trim();

    if (!normalizedQuery) return;

    navigate(`/search?q=${encodeURIComponent(normalizedQuery)}&type=videos`);

    handleBack();
  }

  if (!searchFocused) return null;

  return (
    <div className="flex w-full items-center gap-2 lg:hidden">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back"
        className="
          flex h-9 w-9 shrink-0 items-center justify-center
          rounded-lg text-gray-300 transition
          hover:bg-white/10 hover:text-white
        "
      >
        <ChevronLeft size={20} />
      </button>

      <form onSubmit={handleSubmit} className="relative min-w-0 flex-1">
        <input
          ref={searchInputRef}
          autoFocus
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search videos, playlists, or users..."
          aria-label="Search Vidio"
          className="
            h-10 w-full rounded-full border border-red-600
            bg-[#111318] px-4 pr-12 text-sm text-white
            outline-none placeholder:text-gray-500
          "
        />

        <button
          type="submit"
          aria-label="Submit search"
          className="
            absolute right-1 top-1 flex h-8 w-9
            items-center justify-center rounded-full
            bg-[#CE2029] text-white transition hover:bg-red-700
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
      </form>
    </div>
  );
}

export default FocusedSearch;

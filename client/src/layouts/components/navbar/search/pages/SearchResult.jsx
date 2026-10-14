import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search as SearchIcon,
  Video,
  Users,
  ListVideo,
  LoaderCircle,
} from "lucide-react";

import {
  searchVideos,
  searchUsers,
  searchPlaylists,
} from "../search.service.js";

import VideoSearchCard from "../components/VideoSearchCard.jsx";
import UserSearchCard from "../components/UserSearchCard.jsx";
import PlaylistSearchCard from "../components/PlaylistSearchCard.jsx";

const TABS = [
  { id: "videos", label: "Videos", icon: Video },
  { id: "users", label: "Users", icon: Users },
  { id: "playlists", label: "Playlists", icon: ListVideo },
];

const SEARCH_FUNCTIONS = {
  videos: searchVideos,
  users: searchUsers,
  playlists: searchPlaylists,
};

const EMPTY_PAGINATION = {
  docs: [],
  page: 1,
  totalPages: 0,
  totalDocs: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q")?.trim() || "";
  const requestedType = searchParams.get("type") || "videos";

  const type = TABS.some((tab) => tab.id === requestedType)
    ? requestedType
    : "videos";

  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") || "1", 10) || 1,
  );

  const [result, setResult] = useState(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchResults() {
      if (!query || (type !== "videos" && query.length < 2)) {
        setResult(EMPTY_PAGINATION);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setResult(EMPTY_PAGINATION);

      try {
        const searchFunction = SEARCH_FUNCTIONS[type];
        const data = await searchFunction(query, page, 10);

        if (cancelled) return;

        setResult({
          ...EMPTY_PAGINATION,
          ...data,
          docs: Array.isArray(data?.docs) ? data.docs : [],
        });
      } catch (err) {
        if (cancelled) return;

        setResult(EMPTY_PAGINATION);
        setError(
          err.response?.data?.message ||
            "Something went wrong while searching.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchResults();

    return () => {
      cancelled = true;
    };
  }, [query, type, page]);

  function updateSearchParams(updates) {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });

    setSearchParams(nextParams);
  }

  function handleTabChange(nextType) {
    updateSearchParams({
      type: nextType,
      page: null,
    });
  }

  function handlePageChange(nextPage) {
    updateSearchParams({
      page: nextPage === 1 ? null : nextPage,
    });
  }

  function renderResult(item) {
    switch (type) {
      case "videos":
        return <VideoSearchCard key={item._id} video={item} />;

      case "users":
        return <UserSearchCard key={item._id} user={item} />;

      case "playlists":
        return <PlaylistSearchCard key={item._id} playlist={item} />;

      default:
        return null;
    }
  }

  const minimumLengthRequired = type !== "videos" && query.length < 2;
  const canDisplayResults = query && !minimumLengthRequired;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white sm:text-2xl">
          Search results
        </h1>

        {query ? (
          <p className="mt-1 text-sm text-gray-400">
            Results for{" "}
            <span className="font-medium text-gray-200">"{query}"</span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-gray-400">
            Enter a search term in the navbar to get started.
          </p>
        )}
      </div>

      {/* Category tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-white/10">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = type === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleTabChange(id)}
              aria-pressed={active}
              className={`
                flex shrink-0 items-center gap-2 border-b-2 px-4 py-3
                text-sm font-medium transition
                ${
                  active
                    ? "border-red-600 text-white"
                    : "border-transparent text-gray-400 hover:text-white"
                }
              `}
            >
              <Icon size={17} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div
          className="flex min-h-48 items-center justify-center gap-3 text-sm text-gray-400"
          role="status"
        >
          <LoaderCircle size={20} className="animate-spin" />
          Searching {type}...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {/* Empty query */}
      {!loading && !error && !query && (
        <div className="flex min-h-48 flex-col items-center justify-center text-center">
          <SearchIcon size={32} className="text-gray-600" />

          <p className="mt-3 text-sm text-gray-400">
            Search videos, creators, and playlists.
          </p>
        </div>
      )}

      {/* Query too short */}
      {!loading && !error && query && minimumLengthRequired && (
        <p className="py-12 text-center text-sm text-gray-400">
          Enter at least 2 characters to search {type}.
        </p>
      )}

      {/* No results */}
      {!loading && !error && canDisplayResults && result.docs.length === 0 && (
        <div className="flex min-h-48 flex-col items-center justify-center text-center">
          <SearchIcon size={30} className="text-gray-600" />

          <p className="mt-3 font-medium text-gray-300">No {type} found</p>

          <p className="mt-1 text-sm text-gray-500">Try another search term.</p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && canDisplayResults && result.docs.length > 0 && (
        <>
          <p className="mb-4 text-xs text-gray-500">
            {result.totalDocs} results
          </p>

          <div className="flex w-full max-w-4xl flex-col gap-4">
            {result.docs.map(renderResult)}
          </div>

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={!result.hasPrevPage}
                onClick={() => handlePageChange(page - 1)}
                className="
                    rounded-lg border border-white/10 px-4 py-2
                    text-sm text-gray-300 transition hover:bg-white/5
                    disabled:cursor-not-allowed disabled:opacity-40
                  "
              >
                Previous
              </button>

              <span className="text-sm text-gray-400">
                Page {result.page} of {result.totalPages}
              </span>

              <button
                type="button"
                disabled={!result.hasNextPage}
                onClick={() => handlePageChange(page + 1)}
                className="
                    rounded-lg border border-white/10 px-4 py-2
                    text-sm text-gray-300 transition hover:bg-white/5
                    disabled:cursor-not-allowed disabled:opacity-40
                  "
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchResults;

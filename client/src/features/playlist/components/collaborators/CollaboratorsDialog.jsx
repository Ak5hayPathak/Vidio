import { useEffect, useRef, useState } from "react";
import {
  Search,
  X,
  UserPlus,
  LoaderCircle,
  Check,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  searchUsers,
  invitePlaylistCollaborator,
} from "../../collab.service.js";

function CollaboratorsDialog({ playlist, onClose }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState(false);
  const [invitingUserId, setInvitingUserId] = useState(null);
  const [invitedUserIds, setInvitedUserIds] = useState([]);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const requestId = useRef(0);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      requestId.current += 1;
      setUsers([]);
      setPagination({
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
      setLoading(false);
      setError("");
      return;
    }

    const currentRequestId = ++requestId.current;

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const result = await searchUsers(trimmedQuery, page, 10);

        if (currentRequestId !== requestId.current) return;

        setUsers(Array.isArray(result?.docs) ? result.docs : []);
        setPagination({
          totalPages: result?.totalPages ?? 0,
          totalDocs: result?.totalDocs ?? 0,
          hasNextPage: result?.hasNextPage ?? false,
          hasPrevPage: result?.hasPrevPage ?? false,
        });
      } catch (err) {
        if (currentRequestId !== requestId.current) return;

        setUsers([]);
        setPagination({
          totalPages: 0,
          totalDocs: 0,
          hasNextPage: false,
          hasPrevPage: false,
        });
        setError(err.response?.data?.message || "Couldn't search for users.");
      } finally {
        if (currentRequestId === requestId.current) {
          setLoading(false);
        }
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [query, page]);

  function handleQueryChange(value) {
    setQuery(value);
    setPage(1);
    setFeedback("");
    setError("");
  }

  async function handleInvite(user) {
    const userId = String(user._id);

    setInvitingUserId(userId);
    setError("");
    setFeedback("");

    try {
      await invitePlaylistCollaborator(playlist._id, userId);

      setInvitedUserIds((current) =>
        current.includes(userId) ? current : [...current, userId],
      );

      setFeedback(`Invitation sent to @${user.username}.`);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't send the invitation.");
    } finally {
      setInvitingUserId(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="collaborators-dialog-title"
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111214] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2
              id="collaborators-dialog-title"
              className="text-lg font-semibold text-white"
            >
              Invite collaborators
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Invite people to contribute to this playlist.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={19} />
          </button>
        </header>

        <div className="p-5">
          <label
            htmlFor="collaborator-search"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Search users
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#08090b] px-3 focus-within:border-red-500/70">
            <Search size={18} className="shrink-0 text-gray-500" />

            <input
              id="collaborator-search"
              type="search"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Username or full name"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-gray-600"
            />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Enter at least 2 characters to search.
          </p>

          {feedback && (
            <p role="status" className="mt-3 text-sm text-green-400">
              {feedback}
            </p>
          )}

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
              <LoaderCircle size={17} className="animate-spin" />
              Searching users...
            </div>
          )}

          {!loading && query.trim().length < 2 && (
            <div className="flex flex-col items-center py-8 text-center">
              <Users size={28} className="text-gray-600" />
              <p className="mt-3 text-sm text-gray-400">
                Search for people to invite.
              </p>
            </div>
          )}

          {!loading &&
            query.trim().length >= 2 &&
            !error &&
            users.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">
                No users found.
              </p>
            )}

          <div className="space-y-2">
            {!loading &&
              users.map((user) => {
                const userId = String(user._id);
                const invited = invitedUserIds.includes(userId);
                const inviting = invitingUserId === userId;

                return (
                  <div
                    key={userId}
                    className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/[0.04]"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-full bg-white/5 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-gray-300">
                        {(user.fullName || user.username || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {user.fullName || user.username}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        @{user.username}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={invited || inviting || invitingUserId !== null}
                      onClick={() => handleInvite(user)}
                      className="flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {inviting ? (
                        <LoaderCircle size={15} className="animate-spin" />
                      ) : invited ? (
                        <Check size={15} />
                      ) : (
                        <UserPlus size={15} />
                      )}

                      <span>
                        {inviting ? "Sending" : invited ? "Invited" : "Invite"}
                      </span>
                    </button>
                  </div>
                );
              })}
          </div>

          {!loading && query.trim().length >= 2 && users.length > 0 && (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="text-xs text-gray-500">
                Page {page} of {pagination.totalPages}
                <span className="ml-1">({pagination.totalDocs} users)</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((current) => current - 1)}
                  className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((current) => current + 1)}
                  className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default CollaboratorsDialog;

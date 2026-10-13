import { useCallback, useEffect, useState } from "react";
import {
  Users,
  UserRound,
  UserMinus,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  getPlaylistCollaborators,
  removePlaylistCollaborator,
} from "../../collab.service.js";

function getCollaborators(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.docs)) return payload.docs;
  if (Array.isArray(payload?.collaborators)) return payload.collaborators;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data?.docs)) return payload.data.docs;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
}

function getCollaboratorUser(item) {
  return (
    item?.userDetails ??
    item?.user ??
    item?.collaborator ??
    item?.collaboratorUser ??
    item
  );
}

function getUserId(user) {
  const id = user?._id ?? user?.id ?? user?.userId;
  return id == null ? "" : String(id);
}

function CollaboratorsSection({ playlistId, isOwner }) {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingUserId, setRemovingUserId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchCollaborators = useCallback(async () => {
    if (!playlistId) {
      setCollaborators([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getPlaylistCollaborators(playlistId);
      const list = getCollaborators(result);

      setCollaborators(list);
    } catch (err) {
      console.error(
        "Failed to fetch playlist collaborators:",
        err.response?.data || err,
      );

      setError(
        err.response?.data?.message || "Couldn't load playlist collaborators.",
      );
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  async function handleRemove(user, userId) {
    const name = user.fullName || user.username || "this collaborator";

    if (
      removingUserId !== null ||
      !window.confirm(`Remove ${name} from this playlist?`)
    ) {
      return;
    }

    setRemovingUserId(userId);
    setError("");
    setNotice("");

    try {
      await removePlaylistCollaborator(playlistId, userId);

      setCollaborators((current) =>
        current.filter(
          (item) => getUserId(getCollaboratorUser(item)) !== userId,
        ),
      );

      setNotice(`${name} was removed from the playlist.`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't remove this collaborator.",
      );
    } finally {
      setRemovingUserId(null);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-[#111214] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
            <Users size={20} className="text-gray-300" />
          </div>

          <div>
            <h2 className="font-semibold text-white">Collaborators</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              People contributing to this playlist
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchCollaborators}
          disabled={loading}
          aria-label="Refresh collaborators"
          title="Refresh collaborators"
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
        >
          {error}
          <button
            type="button"
            onClick={fetchCollaborators}
            className="ml-2 font-medium underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {notice && (
        <p role="status" className="mt-4 text-sm text-green-400">
          {notice}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
          <LoaderCircle size={18} className="animate-spin" />
          Loading collaborators...
        </div>
      ) : collaborators.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Users size={28} className="text-gray-600" />

          <p className="mt-3 text-sm font-medium text-gray-300">
            No collaborators yet
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Accepted collaborators will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-white/[0.06]">
          {collaborators.map((item, index) => {
            const collaborator = getCollaboratorUser(item);
            const userId = getUserId(collaborator);

            // Ignore malformed records rather than rendering broken rows.
            if (!userId) return null;

            const name =
              collaborator.fullName || collaborator.username || "Vidio user";

            const isRemoving = removingUserId === userId;

            return (
              <div
                key={item?._id || userId || index}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                {collaborator.avatar ? (
                  <img
                    src={collaborator.avatar}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-full bg-white/5 object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
                    <UserRound size={19} className="text-gray-400" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {name}
                  </p>

                  {collaborator.username && (
                    <p className="truncate text-sm text-gray-500">
                      @{collaborator.username}
                    </p>
                  )}
                </div>

                {isOwner && (
                  <button
                    type="button"
                    disabled={removingUserId !== null}
                    onClick={() => handleRemove(collaborator, userId)}
                    title={`Remove ${name}`}
                    aria-label={`Remove ${name} from playlist`}
                    className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRemoving ? (
                      <LoaderCircle size={15} className="animate-spin" />
                    ) : (
                      <UserMinus size={15} />
                    )}

                    <span className="hidden sm:inline">
                      {isRemoving ? "Removing..." : "Remove"}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default CollaboratorsSection;

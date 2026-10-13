import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Check,
  X,
  LoaderCircle,
  RefreshCw,
  ListVideo,
  UserRound,
  Send,
  Clock3,
} from "lucide-react";

import {
  getPendingPlaylistInvitations,
  getSentPendingPlaylistInvitations,
  acceptPlaylistInvitation,
  rejectPlaylistInvitation,
  cancelPlaylistInvitation,
} from "../collab.service.js";

function getInvitations(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.docs)) return payload.docs;
  if (Array.isArray(payload?.invitations)) return payload.invitations;
  if (Array.isArray(payload?.data?.docs)) return payload.data.docs;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
}

function getId(item) {
  const id = item?._id ?? item?.id ?? item?.invitationId;
  return id == null ? "" : String(id);
}

function getUser(invitation, type) {
  if (type === "received") {
    return (
      invitation?.playlistDetails?.userDetails ??
      invitation?.inviterDetails ??
      invitation?.senderDetails ??
      invitation?.inviter ??
      {}
    );
  }

  return (
    invitation?.userDetails ??
    invitation?.invitedUserDetails ??
    invitation?.recipientDetails ??
    invitation?.invitee ??
    invitation?.user ??
    {}
  );
}

function getPlaylist(invitation) {
  return invitation?.playlistDetails ?? invitation?.playlist ?? {};
}

function getAvatar(user) {
  return user?.avatar?.url ?? user?.avatar ?? user?.profilePicture ?? "";
}

function getThumbnail(playlist) {
  return (
    playlist?.thumbnail?.url ??
    playlist?.thumbnail ??
    playlist?.thumbnailUrl ??
    ""
  );
}

function getDisplayName(user) {
  return user?.fullName || user?.username || "Vidio user";
}

function PlaylistInvitations() {
  const [activeTab, setActiveTab] = useState("received");
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [processingId, setProcessingId] = useState("");

  const fetchInvitations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setNotice("");

    try {
      const [receivedResult, sentResult] = await Promise.all([
        getPendingPlaylistInvitations(),
        getSentPendingPlaylistInvitations(),
      ]);

      setReceived(getInvitations(receivedResult));
      setSent(getInvitations(sentResult));
    } catch (err) {
      console.error(
        "Failed to fetch playlist invitations:",
        err.response?.data || err,
      );

      setError(
        err.response?.data?.message ||
          "Couldn't load your playlist invitations.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleInvitationAction = async (invitation, action) => {
    const invitationId = getId(invitation);

    if (!invitationId || processingId) return;

    const user = getUser(invitation, activeTab);
    const displayName = getDisplayName(user);

    let confirmationMessage;

    if (action === "accept") {
      confirmationMessage = "Accept this playlist collaboration invitation?";
    } else if (action === "reject") {
      confirmationMessage = "Decline this playlist collaboration invitation?";
    } else {
      confirmationMessage = `Cancel the invitation sent to ${displayName}?`;
    }

    if (action === "cancel" && !window.confirm(confirmationMessage)) {
      return;
    }

    setProcessingId(invitationId);
    setError("");
    setNotice("");

    try {
      if (action === "accept") {
        await acceptPlaylistInvitation(invitationId);
        setReceived((current) =>
          current.filter((item) => getId(item) !== invitationId),
        );
        setNotice(
          "Invitation accepted. You can now collaborate on the playlist.",
        );
      } else if (action === "reject") {
        await rejectPlaylistInvitation(invitationId);
        setReceived((current) =>
          current.filter((item) => getId(item) !== invitationId),
        );
        setNotice("Invitation declined.");
      } else {
        await cancelPlaylistInvitation(invitationId);
        setSent((current) =>
          current.filter((item) => getId(item) !== invitationId),
        );
        setNotice("Sent invitation cancelled.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Couldn't ${
            action === "accept"
              ? "accept"
              : action === "reject"
                ? "decline"
                : "cancel"
          } the invitation.`,
      );
    } finally {
      setProcessingId("");
    }
  };

  const invitations = activeTab === "received" ? received : sent;

  function renderInvitation(invitation) {
    const invitationId = getId(invitation);
    const user = getUser(invitation, activeTab);
    const playlist = getPlaylist(invitation);
    const avatar = getAvatar(user);
    const thumbnail = getThumbnail(playlist);
    const isProcessing = processingId === invitationId;
    const isReceived = activeTab === "received";

    return (
      <article
        key={invitationId}
        className="rounded-2xl border border-white/10 bg-[#111214] p-4 sm:p-5"
      >
        <div className="flex items-start gap-3">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full bg-white/5 object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.07]">
              <UserRound size={20} className="text-gray-400" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm leading-6 text-gray-300">
              <span className="font-semibold text-white">
                {getDisplayName(user)}
              </span>{" "}
              {isReceived
                ? "invited you to collaborate on a playlist."
                : "is invited to collaborate on your playlist."}
            </p>

            {user?.username && (
              <p className="mt-0.5 text-xs text-gray-500">@{user.username}</p>
            )}

            <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt=""
                  className="h-12 w-16 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                  <ListVideo size={20} className="text-gray-400" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {playlist?.name || "Untitled playlist"}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Playlist collaboration
                </p>
              </div>

              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/[0.08] px-2 py-1 text-xs text-amber-300">
                <Clock3 size={12} />
                Pending
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t border-white/[0.06] pt-4">
          {isReceived ? (
            <>
              <button
                type="button"
                disabled={Boolean(processingId)}
                onClick={() => handleInvitationAction(invitation, "reject")}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <X size={16} />
                )}
                Decline
              </button>

              <button
                type="button"
                disabled={Boolean(processingId)}
                onClick={() => handleInvitationAction(invitation, "accept")}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Accept
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={Boolean(processingId)}
              onClick={() => handleInvitationAction(invitation, "cancel")}
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/[0.15] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <X size={16} />
              )}
              Cancel invitation
            </button>
          )}
        </div>
      </article>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#111214]">
            <Mail size={22} className="text-gray-200" />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">
              Playlist invitations
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage your playlist collaboration invitations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchInvitations(true)}
          disabled={loading || refreshing}
          aria-label="Refresh invitations"
          title="Refresh invitations"
          className="rounded-xl border border-white/10 p-3 text-gray-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
        </button>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-[#111214] p-1.5">
        <button
          type="button"
          onClick={() => {
            setActiveTab("received");
            setError("");
            setNotice("");
          }}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition ${
            activeTab === "received"
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <Mail size={16} />
          Received
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
            {received.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("sent");
            setError("");
            setNotice("");
          }}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition ${
            activeTab === "sent"
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <Send size={16} />
          Sent
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
            {sent.length}
          </span>
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className="mt-6 rounded-xl border border-green-500/20 bg-green-500/[0.07] p-4 text-sm text-green-400"
        >
          {notice}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4 text-sm text-red-400"
        >
          {error}
          <button
            type="button"
            onClick={() => fetchInvitations(true)}
            className="ml-2 font-medium underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      <section className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#111214] py-16">
            <LoaderCircle size={26} className="animate-spin text-gray-400" />
            <p className="mt-3 text-sm text-gray-400">Loading invitations...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-[#111214] px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.05]">
              {activeTab === "received" ? (
                <Mail size={26} className="text-gray-500" />
              ) : (
                <Send size={26} className="text-gray-500" />
              )}
            </div>

            <h2 className="mt-4 font-medium text-white">
              {activeTab === "received"
                ? "You're all caught up"
                : "No pending sent invitations"}
            </h2>

            <p className="mt-2 max-w-sm text-sm text-gray-400">
              {activeTab === "received"
                ? "You don't have any pending playlist invitations right now."
                : "Invitations you send to potential collaborators will appear here until they respond."}
            </p>

            <Link
              to="/playlists"
              className="mt-5 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/[0.06]"
            >
              Browse your playlists
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-300">
                {activeTab === "received"
                  ? "Pending invitations"
                  : "Invitations awaiting response"}
              </h2>

              <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs text-gray-300">
                {invitations.length}
              </span>
            </div>

            {invitations.map(renderInvitation)}
          </div>
        )}
      </section>
    </main>
  );
}

export default PlaylistInvitations;

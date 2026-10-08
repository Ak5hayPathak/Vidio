import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";

import {
  addReply,
  deleteComment,
  getReplies,
  updateComment,
  toggleCommentLike,
} from "./comment.service.js";

function Comment({ comment, depth = 0, onDeleted, onUpdated }) {
  const { user } = useAuth();

  const [collapsed, setCollapsed] = useState(true);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [replies, setReplies] = useState(comment.replies || []);
  const [repliesLoaded, setRepliesLoaded] = useState(Boolean(comment.replies));

  const [loadingReplies, setLoadingReplies] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  const [liked, setLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const owner = comment.ownerDetails || comment.owner;

  const isOwner = user?._id === owner?._id || user?._id === owner?.id;

  const handleLoadReplies = async () => {
    if (repliesLoaded) {
      setCollapsed((prev) => !prev);
      return;
    }

    try {
      setLoadingReplies(true);

      const data = await getReplies(comment._id, {
        page: 1,
        limit: 10,
        sortType: "desc",
      });

      setReplies(data.docs || []);
      setRepliesLoaded(true);
      setCollapsed(false);
    } catch (error) {
      console.error("Failed to load replies:", error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || submittingReply) return;

    try {
      setSubmittingReply(true);

      const newReply = await addReply(comment._id, replyText.trim());

      setReplies((prev) => [newReply, ...prev]);
      setRepliesLoaded(true);
      setCollapsed(false);

      setReplyText("");
      setReplyOpen(false);
    } catch (error) {
      console.error("Failed to add reply:", error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim() || savingEdit) return;

    try {
      setSavingEdit(true);

      const updatedComment = await updateComment(comment._id, editText.trim());

      setEditText(updatedComment.content);
      setEditing(false);

      onUpdated?.(updatedComment);
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?",
    );

    if (!confirmed || deleting) return;

    try {
      setDeleting(true);

      await deleteComment(comment._id);

      onDeleted?.(comment._id);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setDeleting(false);
    }
  };

  const handleLike = async () => {
    const previousLiked = liked;

    // Update UI immediately
    setLiked(!previousLiked);
    setLikesCount((prev) => prev + (previousLiked ? -1 : 1));

    try {
      await toggleCommentLike(comment._id);
    } catch (error) {
      // Revert UI if the request fails
      setLiked(previousLiked);
      setLikesCount((prev) => prev + (previousLiked ? 1 : -1));

      console.error("Failed to toggle comment like:", error);
    }
  };

  const handleReplyDeleted = (replyId) => {
    setReplies((prev) => prev.filter((reply) => reply._id !== replyId));
  };

  const handleReplyUpdated = (updatedReply) => {
    setReplies((prev) =>
      prev.map((reply) =>
        reply._id === updatedReply._id ? { ...reply, ...updatedReply } : reply,
      ),
    );
  };

  return (
    <div className="relative">
      <div className="flex gap-3">
        <div className="shrink-0">
          {owner?.avatar ? (
            <img
              src={owner.avatar}
              alt={owner.username}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-gray-300">
              {owner?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              @{owner?.username || "unknown"}
            </span>

            <span className="text-xs text-gray-500">
              {comment.createdAt
                ? new Date(comment.createdAt).toLocaleDateString()
                : "just now"}
            </span>

            {comment.isEdited && (
              <span className="text-xs text-gray-600">(edited)</span>
            )}
          </div>

          {editing ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#111318] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-600/50"
              />

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditText(comment.content);
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs text-gray-400 transition hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleEdit}
                  disabled={!editText.trim() || savingEdit}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {savingEdit ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-300">
              {comment.content}
            </p>
          )}

          {!editing && (
            <div className="mt-2 flex items-center gap-1">
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-gray-500 transition hover:bg-white/5 hover:text-gray-300"
              >
                <Heart
                  size={15}
                  fill={liked ? "currentColor" : "none"}
                  className={liked ? "text-red-500" : ""}
                />

                <span className={liked ? "text-red-500" : ""}>
                  {likesCount}
                </span>
              </button>

              <button
                onClick={() => setReplyOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-gray-500 transition hover:bg-white/5 hover:text-gray-300"
              >
                <MessageSquare size={15} />
                Reply
              </button>

              {isOwner && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-gray-500 transition hover:bg-white/5 hover:text-gray-300"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-gray-500 transition hover:bg-red-600/10 hover:text-red-500 disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}

              <button className="rounded-full p-1.5 text-gray-500 transition hover:bg-white/5 hover:text-gray-300">
                <MoreHorizontal size={16} />
              </button>
            </div>
          )}

          {replyOpen && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleReply();
                }}
                placeholder={`Reply to @${owner?.username || "user"}`}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#111318] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-600/50"
                autoFocus
              />

              <button
                onClick={handleReply}
                disabled={!replyText.trim() || submittingReply}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submittingReply ? "Replying..." : "Reply"}
              </button>
            </div>
          )}

          {comment.repliesCount > 0 && (
            <button
              onClick={handleLoadReplies}
              disabled={loadingReplies}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-gray-300"
            >
              {!repliesLoaded || collapsed ? (
                <ChevronRight size={15} />
              ) : (
                <ChevronDown size={15} />
              )}

              {loadingReplies
                ? "Loading replies..."
                : !repliesLoaded || collapsed
                  ? `Show ${comment.repliesCount} ${
                      comment.repliesCount === 1 ? "reply" : "replies"
                    }`
                  : "Hide replies"}
            </button>
          )}
        </div>
      </div>

      {!collapsed && repliesLoaded && replies.length > 0 && (
        <div className="ml-[18px] border-l border-white/10 pl-6">
          <div className="mt-3 space-y-4">
            {replies.map((reply) => (
              <Comment
                key={reply._id}
                comment={reply}
                depth={depth + 1}
                onDeleted={handleReplyDeleted}
                onUpdated={handleReplyUpdated}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Comment;
